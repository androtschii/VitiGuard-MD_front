import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { WeatherEventsSection } from './WeatherEventsSection'

const URL_EVENTS = '/api/v1/vineyards/plot-1/weather-events'
const hail = {
  id: 'e1',
  vineyard_id: 'plot-1',
  occurred_on: '2026-06-01',
  kind: 'hail',
  severity: 3,
  note: 'Побиты верхние ряды',
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
}

function serve(items: unknown[]) {
  server.use(http.get(URL_EVENTS, () => HttpResponse.json(items)))
}

describe('WeatherEventsSection', () => {
  it('показывает событие и удаляет его', async () => {
    serve([hail, { ...hail, id: 'e2', note: null, kind: 'frost' }])
    let deleted = false
    server.use(
      http.delete(`${URL_EVENTS}/e1`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderWithQueryClient(<WeatherEventsSection vineyardId="plot-1" />)

    expect(await screen.findByText('Побиты верхние ряды')).toBeInTheDocument()
    expect(screen.getAllByText(/Град · Сильно/)).toHaveLength(1)

    await userEvent.click(
      screen.getAllByRole('button', { name: /Удалить событие/ })[0],
    )
    await waitFor(() => expect(deleted).toBe(true))
  })

  it('отправляет выбранное событие и чистит заметку', async () => {
    serve([])
    let body: unknown
    server.use(
      http.post(URL_EVENTS, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(hail, { status: 201 })
      }),
    )
    renderWithQueryClient(<WeatherEventsSection vineyardId="plot-1" />)
    await screen.findByText('Событий пока нет.')

    await userEvent.selectOptions(
      screen.getByLabelText(/Что случилось/),
      'hail',
    )
    await userEvent.selectOptions(screen.getByLabelText(/Повреждения/), '3')
    await userEvent.clear(screen.getByLabelText(/День/))
    await userEvent.type(screen.getByLabelText(/День/), '2026-01-02')
    await userEvent.type(screen.getByLabelText(/Заметка/), ' Ряды ')
    await userEvent.click(
      screen.getByRole('button', { name: 'Отметить событие' }),
    )

    await waitFor(() =>
      expect(body).toEqual({
        occurred_on: '2026-01-02',
        kind: 'hail',
        severity: 3,
        note: 'Ряды',
      }),
    )
    await waitFor(() =>
      expect(screen.getByLabelText(/Заметка/)).toHaveValue(''),
    )
  })

  it('пустая заметка уходит как null', async () => {
    serve([])
    let body: { note?: unknown } = {}
    server.use(
      http.post(URL_EVENTS, async ({ request }) => {
        body = (await request.json()) as { note?: unknown }
        return HttpResponse.json(hail, { status: 201 })
      }),
    )
    renderWithQueryClient(<WeatherEventsSection vineyardId="plot-1" />)
    await screen.findByText('Событий пока нет.')

    await userEvent.click(
      screen.getByRole('button', { name: 'Отметить событие' }),
    )

    await waitFor(() => expect(body.note).toBeNull())
  })

  it('показывает ошибки сохранения и удаления', async () => {
    serve([hail])
    server.use(
      http.post(URL_EVENTS, () =>
        HttpResponse.json({ detail: 'Нельзя сохранить' }, { status: 400 }),
      ),
      http.delete(`${URL_EVENTS}/e1`, () =>
        HttpResponse.json({ detail: 'Нельзя удалить' }, { status: 400 }),
      ),
    )
    renderWithQueryClient(<WeatherEventsSection vineyardId="plot-1" />)
    await screen.findByText('Побиты верхние ряды')

    await userEvent.click(
      screen.getByRole('button', { name: 'Отметить событие' }),
    )
    expect(await screen.findByText(/Нельзя сохранить/)).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: /Удалить событие/ }),
    )
    expect(await screen.findByText(/Нельзя удалить/)).toBeInTheDocument()
  })

  it('сообщает, что журнал не загрузился', async () => {
    server.use(
      http.get(URL_EVENTS, () =>
        HttpResponse.json({ detail: 'нет' }, { status: 400 }),
      ),
    )
    renderWithQueryClient(<WeatherEventsSection vineyardId="plot-1" />)

    expect(
      await screen.findByText('Не удалось загрузить журнал.'),
    ).toBeInTheDocument()
  })
})
