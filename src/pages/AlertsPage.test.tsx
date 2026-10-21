import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AlertsBell } from '@/components/molecules/AlertsBell'
import { AlertsSummary } from '@/components/organisms/AlertsSummary'
import { alert, alertPage } from '@/test/alertData'
import { renderWithRouter } from '@/test/render'
import { server } from '@/test/server'
import { AlertsPage } from './AlertsPage'

// Запросы к списку: какие параметры приходили
function serveAlerts(respond = () => alertPage([])) {
  const requests: URLSearchParams[] = []
  server.use(
    http.get('/api/v1/alerts', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json(respond())
    }),
  )
  return requests
}

describe('предупреждения', () => {
  beforeEach(() => {
    // «Сегодня» в Кишинёве — 10 июня 2026
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-10T09:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('колокольчик показывает число непрочитанных', async () => {
    server.use(
      http.get('/api/v1/alerts/unread-count', () =>
        HttpResponse.json({ count: 3 }),
      ),
    )
    renderWithRouter(<AlertsBell />)

    const bell = await screen.findByRole('link', {
      name: 'Предупреждения: 3 непрочитанных',
    })
    expect(bell).toHaveAttribute('href', '/alerts')
    expect(bell).toHaveTextContent('3')
  })

  it('без непрочитанных — колокольчик без числа, больше 99 — «99+»', async () => {
    renderWithRouter(<AlertsBell />)
    expect(
      await screen.findByRole('link', { name: 'Предупреждения' }),
    ).toHaveTextContent('')

    server.use(
      http.get('/api/v1/alerts/unread-count', () =>
        HttpResponse.json({ count: 150 }),
      ),
    )
    renderWithRouter(<AlertsBell />)
    expect(await screen.findByText('99+')).toBeInTheDocument()
  })

  it('страница: непрочитанные, отметка и переход ко всем', async () => {
    const requests = serveAlerts(() =>
      alertPage([
        alert('a-1'),
        alert('a-2', {
          disease: 'powdery_mildew',
          day: '2026-06-11',
          forecast: true,
          vineyard_name: 'Пуркарь',
        }),
        alert('a-3', { day: '2026-06-12', forecast: true }),
      ]),
    )
    let read = ''
    server.use(
      http.post('/api/v1/alerts/:id/read', ({ params }) => {
        read = String(params.id)
        return HttpResponse.json(alert(String(params.id)))
      }),
    )
    const user = userEvent.setup()
    renderWithRouter(<AlertsPage />)

    const items = within(
      await screen.findByRole('list', { name: 'Предупреждения' }),
    ).getAllByRole('listitem')
    expect(items[0]).toHaveTextContent(
      /Милдью: высокий риск на участке «Криково».*сегодня/,
    )
    expect(items[1]).toHaveTextContent(/Оидиум.*«Пуркарь».*завтра.*по прогнозу/)
    expect(items[2]).toHaveTextContent(/12 июня/)
    expect(requests[0]?.get('unread')).toBe('true')

    await user.click(within(items[0]).getByRole('button'))
    await waitFor(() => expect(read).toBe('a-1'))

    await user.click(screen.getByRole('radio', { name: 'Все' }))
    await waitFor(() => expect(requests.at(-1)?.has('unread')).toBe(false))
  })

  it('отмечает все прочитанными', async () => {
    serveAlerts(() => alertPage([alert('a-1')]))
    let readAll = false
    server.use(
      http.post('/api/v1/alerts/read-all', () => {
        readAll = true
        return HttpResponse.json({ updated: 1 })
      }),
    )
    renderWithRouter(<AlertsPage />)

    await userEvent.click(
      await screen.findByRole('button', { name: 'Отметить все прочитанными' }),
    )

    await waitFor(() => expect(readAll).toBe(true))
  })

  it('прочитанное — без кнопки, пустой список и ошибка', async () => {
    serveAlerts(() =>
      alertPage([alert('a-1', { read_at: '2026-06-10T07:00:00Z' })]),
    )
    renderWithRouter(<AlertsPage />)
    const list = await screen.findByRole('list', { name: 'Предупреждения' })
    expect(within(list).getByRole('listitem')).not.toHaveTextContent(
      'Прочитано',
    )
    expect(
      screen.getByRole('button', { name: 'Отметить все прочитанными' }),
    ).toBeDisabled()
  })

  it('пусто: нет непрочитанных и не было вовсе', async () => {
    serveAlerts()
    const user = userEvent.setup()
    renderWithRouter(<AlertsPage />)

    expect(
      await screen.findByText('Непрочитанных предупреждений нет.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Все' }))
    expect(
      await screen.findByText('Предупреждений пока не было.'),
    ).toBeInTheDocument()
  })

  it('сообщает об ошибке загрузки', async () => {
    server.use(
      http.get('/api/v1/alerts', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderWithRouter(<AlertsPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить предупреждения',
    )
  })

  it('на главной — три свежих и ссылка на все', async () => {
    const requests = serveAlerts(() =>
      alertPage([alert('a-1'), alert('a-2'), alert('a-3')], 5, 2),
    )
    renderWithRouter(<AlertsSummary />)

    expect(
      await screen.findByRole('link', { name: 'Все предупреждения (5)' }),
    ).toHaveAttribute('href', '/alerts')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(requests[0]?.get('size')).toBe('3')
  })

  it('на главной без предупреждений — ничего', async () => {
    const requests = serveAlerts()
    const { container } = renderWithRouter(<AlertsSummary />)

    await waitFor(() => expect(requests).toHaveLength(1))
    expect(container).toBeEmptyDOMElement()
  })
})
