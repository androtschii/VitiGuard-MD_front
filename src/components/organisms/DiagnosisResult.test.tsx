import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as report from '@/lib/diagnosisReport'
import * as mapImage from '@/lib/mapImage'
import * as sharing from '@/lib/share'
import { diagnosis } from '@/test/handlers'
import { renderWithRouter } from '@/test/render'
import { DiagnosisResult } from './DiagnosisResult'

describe('DiagnosisResult', () => {
  it('показывает диагноз, уверенность и вероятности по убыванию', () => {
    renderWithRouter(<DiagnosisResult diagnosis={diagnosis} />)

    expect(screen.getByText('Оидиум', { selector: 'p' })).toHaveClass(
      'text-danger',
    )
    expect(screen.getByText(/Уверенность модели: 93\s%/)).toBeInTheDocument()
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(6)
    expect(items[0]).toHaveTextContent(/Оидиум93\s%/)
    expect(items[1]).toHaveTextContent(/Милдью4\s%/)
    expect(screen.getByText(/Модель: efficientnet_b0/)).toBeInTheDocument()
    expect(screen.queryByText(/не уверена/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Открыть в истории' }),
    ).toHaveAttribute('href', '/history')
  })

  it('здоровый лист выделен зелёным', () => {
    renderWithRouter(
      <DiagnosisResult
        diagnosis={{ ...diagnosis, disease: 'healthy', top: [] }}
      />,
    )

    expect(screen.getByText('Здоровый лист')).toHaveClass('text-emerald-700')
  })

  it('на снимке не лист винограда — диагноз не показывается', () => {
    renderWithRouter(
      <DiagnosisResult diagnosis={{ ...diagnosis, grape_leaf: false }} />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Похоже, на фото не лист винограда',
    )
    expect(screen.queryByText('Оидиум')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('предупреждает, когда модель не уверена', () => {
    renderWithRouter(
      <DiagnosisResult
        diagnosis={{ ...diagnosis, confidence: 0.41, low_confidence: true }}
      />,
    )

    const title = screen.getByText('Не удалось уверенно определить')
    expect(title).toHaveClass('text-ink')
    expect(title).not.toHaveClass('text-danger')
    expect(title).not.toHaveClass('text-emerald-700')
    expect(screen.getByText('Вероятнее всего: Оидиум')).toBeInTheDocument()
    expect(screen.getByText(/Модель не уверена в ответе/)).toBeInTheDocument()
    expect(screen.getByText(/Уверенность модели: 41\s%/)).toBeInTheDocument()
  })

  it('с переданным фото показывает кнопки PDF и Поделиться, скачивает PDF', async () => {
    const photo = new Blob(['photo'], { type: 'image/jpeg' })
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' })
    vi.spyOn(report, 'diagnosisPdf').mockResolvedValue(pdf)
    const save = vi.spyOn(mapImage, 'saveBlob').mockImplementation(() => {})

    renderWithRouter(<DiagnosisResult diagnosis={diagnosis} photo={photo} />)

    const pdfButton = screen.getByRole('button', {
      name: 'Скачать карточку проверки в PDF',
    })
    const shareButton = screen.getByRole('button', { name: 'Поделиться' })
    expect(pdfButton).toBeInTheDocument()
    expect(shareButton).toBeInTheDocument()

    await userEvent.click(pdfButton)

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        pdf,
        expect.stringMatching(/^vitiguard-diagnosis-/),
      ),
    )
  })

  it('делится результатом через меню «Поделиться»', async () => {
    const photo = new Blob(['photo'], { type: 'image/jpeg' })
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' })
    vi.spyOn(report, 'diagnosisPdf').mockResolvedValue(pdf)
    const send = vi.spyOn(sharing, 'share').mockResolvedValue('shared')

    renderWithRouter(<DiagnosisResult diagnosis={diagnosis} photo={photo} />)

    await userEvent.click(screen.getByRole('button', { name: 'Поделиться' }))

    await waitFor(() => expect(send).toHaveBeenCalled())
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('при копировании текста показывает статус', async () => {
    const photo = new Blob(['photo'], { type: 'image/jpeg' })
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' })
    vi.spyOn(report, 'diagnosisPdf').mockResolvedValue(pdf)
    vi.spyOn(sharing, 'share').mockResolvedValue('copied')

    renderWithRouter(<DiagnosisResult diagnosis={diagnosis} photo={photo} />)

    await userEvent.click(screen.getByRole('button', { name: 'Поделиться' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Описание проверки скопировано',
    )
  })

  it('сообщает об ошибке создания PDF', async () => {
    const photo = new Blob(['photo'], { type: 'image/jpeg' })
    vi.spyOn(report, 'diagnosisPdf').mockRejectedValue(new Error('fail'))

    renderWithRouter(<DiagnosisResult diagnosis={diagnosis} photo={photo} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Скачать карточку проверки в PDF' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось сохранить карточку',
    )
  })

  it('сообщает об ошибке при сбое «Поделиться»', async () => {
    const photo = new Blob(['photo'], { type: 'image/jpeg' })
    vi.spyOn(report, 'diagnosisPdf').mockResolvedValue(new Blob(['%PDF']))
    vi.spyOn(sharing, 'share').mockRejectedValue(new Error('share failed'))

    renderWithRouter(<DiagnosisResult diagnosis={diagnosis} photo={photo} />)

    await userEvent.click(screen.getByRole('button', { name: 'Поделиться' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось поделиться проверкой',
    )
  })
})
