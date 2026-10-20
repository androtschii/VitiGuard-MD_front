import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import * as report from '@/lib/diagnosisReport'
import * as mapImage from '@/lib/mapImage'
import { record } from '@/test/historyData'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { DiagnosisCard } from './DiagnosisCard'

describe('DiagnosisCard', () => {
  it('показывает фото, диагноз, участок и дату', async () => {
    renderWithQueryClient(<DiagnosisCard record={record('r-1')} />)

    expect(
      await screen.findByRole('img', { name: 'Фото листа: Чёрная гниль' }),
    ).toHaveAttribute('src', expect.stringMatching(/^blob:/))
    expect(screen.getByRole('heading', { name: 'Чёрная гниль' })).toHaveClass(
      'text-danger',
    )
    expect(screen.getByText(/Уверенность модели: 93\s%/)).toBeInTheDocument()
    expect(screen.getByText('Криково')).toBeInTheDocument()
    expect(screen.getByText(/10 июн\. 2026/)).toBeInTheDocument()
  })

  it('здоровый лист без участка', () => {
    renderWithQueryClient(
      <DiagnosisCard
        record={record('r-2', {
          disease: 'healthy',
          vineyard_id: null,
          vineyard_name: null,
        })}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Здоровый лист' })).toHaveClass(
      'text-emerald-700',
    )
    expect(screen.getByText('Без участка')).toBeInTheDocument()
  })

  it('без фото в хранилище так и пишет', async () => {
    server.use(
      http.get('/api/v1/diagnoses/:id/image', () =>
        HttpResponse.json({ detail: 'Фото не найдено' }, { status: 404 }),
      ),
    )
    renderWithQueryClient(<DiagnosisCard record={record('r-3')} />)

    expect(await screen.findByText('Фото недоступно')).toBeInTheDocument()
  })

  it('удаляет только после подтверждения', async () => {
    let deleted = ''
    server.use(
      http.delete('/api/v1/diagnoses/:id', ({ params }) => {
        deleted = String(params.id)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderWithQueryClient(<DiagnosisCard record={record('r-4')} />)

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }))
    await userEvent.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(deleted).toBe('')

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Удалить проверку?' }),
    )

    await screen.findByRole('button', { name: 'Удалить проверку?' })
    expect(deleted).toBe('r-4')
  })

  it('сообщает, если удалить не удалось', async () => {
    server.use(
      http.delete('/api/v1/diagnoses/:id', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderWithQueryClient(<DiagnosisCard record={record('r-5')} />)

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Удалить проверку?' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось удалить проверку',
    )
  })

  it('показывает заключение агронома', () => {
    renderWithQueryClient(
      <DiagnosisCard
        record={record('r-6', {
          review: {
            disease: 'black_rot',
            comment: null,
            reviewed_at: '2026-06-11T08:00:00Z',
            reviewer: 'Мария',
          },
        })}
      />,
    )

    expect(screen.getByText('Мария: диагноз подтверждён')).toBeInTheDocument()
  })

  it('исправление с комментарием и без имени эксперта', () => {
    renderWithQueryClient(
      <DiagnosisCard
        record={record('r-7', {
          review: {
            disease: 'esca',
            comment: 'Тигровые полосы',
            reviewed_at: '2026-06-11T08:00:00Z',
            reviewer: null,
          },
        })}
      />,
    )

    expect(
      screen.getByText('Агроном: на самом деле — Эска'),
    ).toBeInTheDocument()
    expect(screen.getByText('Тигровые полосы')).toBeInTheDocument()
  })

  it('скачивает карточку в PDF вместе с маской поражения', async () => {
    let lesionRequested = false
    server.use(
      http.get('/api/v1/diagnoses/:id/overlays/lesion', () => {
        lesionRequested = true
        return HttpResponse.arrayBuffer(new Uint8Array([137, 80]).buffer, {
          headers: { 'Content-Type': 'image/png' },
        })
      }),
    )
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' })
    const build = vi.spyOn(report, 'diagnosisPdf').mockResolvedValue(pdf)
    const save = vi.spyOn(mapImage, 'saveBlob').mockImplementation(() => {})
    renderWithQueryClient(
      <DiagnosisCard
        record={record('r-10', { overlays: ['heatmap', 'lesion'] })}
      />,
    )

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Скачать карточку проверки в PDF',
      }),
    )

    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        pdf,
        'vitiguard-diagnosis-2026-06-10-r-10.pdf',
      ),
    )
    expect(lesionRequested).toBe(true)
    const [, photo, lesion] = build.mock.calls[0]
    expect(photo).toBeInstanceOf(Blob)
    expect(lesion).toBeInstanceOf(Blob)
  })

  it('без маски PDF собирается из фото, сбой — сообщение', async () => {
    const build = vi
      .spyOn(report, 'diagnosisPdf')
      .mockRejectedValue(new Error('canvas'))
    renderWithQueryClient(<DiagnosisCard record={record('r-11')} />)

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Скачать карточку проверки в PDF',
      }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось сохранить карточку',
    )
    expect(build.mock.calls[0][2]).toBeNull()
  })

  it('кнопка заключения — только агроному', async () => {
    renderWithQueryClient(<DiagnosisCard record={record('r-8')} />)
    await screen.findByRole('img')
    expect(screen.queryByRole('button', { name: 'Заключение' })).toBeNull()
  })

  it('агроном открывает окно заключения и закрывает его', async () => {
    server.use(
      http.get('/api/v1/users/me', () =>
        HttpResponse.json({
          id: 'user-2',
          email: 'agro@example.md',
          full_name: 'Мария',
          role: 'agronomist',
          is_active: true,
          created_at: '2026-06-01T00:00:00Z',
          updated_at: '2026-06-01T00:00:00Z',
        }),
      ),
    )
    renderWithQueryClient(<DiagnosisCard record={record('r-9')} />)

    await userEvent.click(
      await screen.findByRole('button', { name: 'Заключение' }),
    )
    expect(
      screen.getByRole('dialog', { name: 'Заключение агронома' }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
