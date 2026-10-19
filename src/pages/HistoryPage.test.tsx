import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { page, record } from '@/test/historyData'
import { sidebarLink } from '@/test/nav'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { HistoryPage } from './HistoryPage'

function renderPage() {
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/history']}>
      <HistoryPage />
    </MemoryRouter>,
  )
}

// Параметры последнего запроса истории
function serveHistory(respond = () => page([record('r-1'), record('r-2')])) {
  const requests: URLSearchParams[] = []
  server.use(
    http.get('/api/v1/diagnoses', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json(respond())
    }),
  )
  return requests
}

describe('HistoryPage', () => {
  it('показывает проверки и отмечает раздел', async () => {
    serveHistory()
    renderPage()

    expect(await screen.findByText('2 проверки')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(sidebarLink('История')).toHaveAttribute('aria-current', 'page')
  })

  it('фильтрует по болезни, участку и датам', async () => {
    const requests = serveHistory()
    server.use(
      http.get('/api/v1/vineyards', () =>
        HttpResponse.json({
          items: [
            {
              id: 'vineyard-1',
              name: 'Криково',
              geometry: { type: 'MultiPolygon', coordinates: [] },
              area_ha: 1,
              variety: null,
              planting_year: null,
              created_at: '2026-06-01T00:00:00Z',
              updated_at: '2026-06-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          size: 100,
          pages: 1,
        }),
      ),
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('2 проверки')

    await user.selectOptions(screen.getByLabelText('Диагноз'), 'esca')
    await user.selectOptions(
      await screen.findByLabelText('Участок'),
      'vineyard-1',
    )
    await user.type(screen.getByLabelText('С даты'), '2026-06-01')
    await user.type(screen.getByLabelText('По дату'), '2026-06-30')

    await waitFor(() => {
      const last = requests.at(-1)
      expect(last?.get('disease')).toBe('esca')
      expect(last?.get('vineyard_id')).toBe('vineyard-1')
      expect(last?.get('date_from')).toBe('2026-06-01')
      expect(last?.get('date_to')).toBe('2026-06-30')
      expect(last?.get('page')).toBe('1')
    })
  })

  it('листает страницы', async () => {
    const requests = serveHistory(() => page([record('r-1')], 13, 2))
    renderPage()
    await screen.findByText('13 проверок')

    await userEvent.click(screen.getByRole('button', { name: 'Страница 2' }))

    await waitFor(() => expect(requests.at(-1)?.get('page')).toBe('2'))
  })

  it('пустая история зовёт проверить лист', async () => {
    renderPage()

    expect(
      await screen.findByText(/Сохранённых проверок пока нет/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Проверить лист' }),
    ).toHaveAttribute('href', '/diagnosis')
  })

  it('по фильтру ничего — говорит об этом', async () => {
    serveHistory(() => page([], 0, 0))
    renderPage()
    await screen.findByText(/Сохранённых проверок пока нет/)

    await userEvent.selectOptions(screen.getByLabelText('Диагноз'), 'esca')

    expect(
      await screen.findByText('Нет проверок по выбранным условиям.'),
    ).toBeInTheDocument()
  })

  it('сообщает об ошибке загрузки', async () => {
    server.use(
      http.get('/api/v1/diagnoses', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить историю',
    )
  })
})
