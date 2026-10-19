import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
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
})
