import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { record } from '@/test/historyData'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { ReviewDialog } from './ReviewDialog'

function captureReview() {
  const sent: unknown[] = []
  let withdrawn = false
  server.use(
    http.put('/api/v1/diagnoses/:id/review', async ({ request }) => {
      sent.push(await request.json())
      return HttpResponse.json(record('r-1'))
    }),
    http.delete('/api/v1/diagnoses/:id/review', () => {
      withdrawn = true
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return { sent, isWithdrawn: () => withdrawn }
}

describe('ReviewDialog', () => {
  it('подтверждает диагноз модели', async () => {
    const { sent } = captureReview()
    const onClose = vi.fn()
    renderWithQueryClient(
      <ReviewDialog record={record('r-1')} open onClose={onClose} />,
    )

    expect(
      screen.getByText(/Модель определила: Чёрная гниль/),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Да, модель права')).toBeChecked()
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить заключение' }),
    )

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent).toEqual([{ disease: 'black_rot', comment: null }])
    // Без заключения отзывать нечего
    expect(
      screen.queryByRole('button', { name: 'Отозвать заключение' }),
    ).toBeNull()
  })

  it('исправляет диагноз с комментарием', async () => {
    const { sent } = captureReview()
    const user = userEvent.setup()
    renderWithQueryClient(
      <ReviewDialog record={record('r-1')} open onClose={vi.fn()} />,
    )

    await user.click(screen.getByLabelText('Нет, на фото другое'))
    const select = screen.getByLabelText('Правильный диагноз')
    // Ответ модели в списке исправлений не предлагается
    expect(screen.queryByRole('option', { name: 'Чёрная гниль' })).toBeNull()
    await user.selectOptions(select, 'downy_mildew')
    await user.type(
      screen.getByLabelText('Комментарий (необязательно)'),
      '  Пятна снизу  ',
    )
    await user.click(
      screen.getByRole('button', { name: 'Сохранить заключение' }),
    )

    await vi.waitFor(() =>
      expect(sent).toEqual([
        { disease: 'downy_mildew', comment: 'Пятна снизу' },
      ]),
    )
  })

  it('открывается с прежним заключением и отзывает его', async () => {
    const { isWithdrawn } = captureReview()
    const onClose = vi.fn()
    renderWithQueryClient(
      <ReviewDialog
        record={record('r-1', {
          review: {
            disease: 'esca',
            comment: 'Тигровые полосы',
            reviewed_at: '2026-06-11T08:00:00Z',
            reviewer: 'Мария',
          },
        })}
        open
        onClose={onClose}
      />,
    )

    expect(screen.getByLabelText('Нет, на фото другое')).toBeChecked()
    expect(screen.getByLabelText('Правильный диагноз')).toHaveValue('esca')
    expect(screen.getByLabelText('Комментарий (необязательно)')).toHaveValue(
      'Тигровые полосы',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Отозвать заключение' }),
    )

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(isWithdrawn()).toBe(true)
  })

  it('отправка формы сохраняет, ошибка — сообщение', async () => {
    server.use(
      http.put('/api/v1/diagnoses/:id/review', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    renderWithQueryClient(
      <ReviewDialog
        record={record('r-1', { disease: 'healthy' })}
        open
        onClose={vi.fn()}
      />,
    )

    // Передумал: «нет», потом «да», потом снова «нет»
    await user.click(screen.getByLabelText('Нет, на фото другое'))
    await user.click(screen.getByLabelText('Да, модель права'))
    expect(screen.queryByLabelText('Правильный диагноз')).toBeNull()
    await user.click(screen.getByLabelText('Нет, на фото другое'))
    // Для здорового листа первое исправление — первая болезнь в списке
    expect(screen.getByLabelText('Правильный диагноз')).toHaveValue('black_rot')
    const form = screen.getByLabelText('Правильный диагноз').closest('form')
    if (!form) throw new Error('нет формы')
    fireEvent.submit(form)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось сохранить заключение',
    )
  })
})
