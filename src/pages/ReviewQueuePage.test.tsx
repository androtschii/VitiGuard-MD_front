import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { page, record } from '@/test/historyData'
import { sidebarLink } from '@/test/nav'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { ReviewQueuePage } from './ReviewQueuePage'

function asRole(role: 'user' | 'agronomist' | 'admin') {
  server.use(
    http.get('/api/v1/users/me', () =>
      HttpResponse.json({
        id: 'user-2',
        email: 'maria@example.md',
        full_name: 'Мария',
        role,
        is_active: true,
        telegram_linked: false,
        created_at: '2026-06-01T00:00:00Z',
        updated_at: '2026-06-01T00:00:00Z',
      }),
    ),
  )
}

function queue() {
  const asked: string[] = []
  server.use(
    http.get('/api/v1/diagnoses/review-queue', ({ request }) => {
      const reviewed = new URL(request.url).searchParams.get('reviewed')
      asked.push(reviewed ?? '')
      return HttpResponse.json(
        reviewed === 'true'
          ? page([])
          : page([
              record('d1', { owner_name: 'Ион Попеску' }),
              record('d2', { owner_name: 'Ион Попеску', disease: 'esca' }),
            ]),
      )
    }),
  )
  return asked
}

function renderPage() {
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/review']}>
      <ReviewQueuePage />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

describe('ReviewQueuePage', () => {
  it('агроном видит чужие проверки с владельцем и без кнопки удаления', async () => {
    asRole('agronomist')
    const asked = queue()
    const user = renderPage()

    expect(await screen.findByText('Проверок: 2')).toBeVisible()
    expect(screen.getAllByText('Виноградарь: Ион Попеску')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Удалить' })).toBeNull()
    expect(asked).toEqual(['false'])
    expect(sidebarLink('Проверки')).toHaveAttribute('aria-current', 'page')

    const tabs = screen.getByRole('tablist', {
      name: 'Какие проверки показать',
    })
    await user.click(within(tabs).getByRole('tab', { name: 'С заключением' }))

    expect(await screen.findByText('Заключений пока нет.')).toBeVisible()
    expect(asked).toContain('true')
    expect(
      within(tabs).getByRole('tab', { name: 'С заключением' }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('пустая очередь подсказывает, что всё просмотрено', async () => {
    asRole('admin')
    server.use(
      http.get('/api/v1/diagnoses/review-queue', () =>
        HttpResponse.json(page([])),
      ),
    )
    renderPage()

    expect(await screen.findByText('Все проверки просмотрены.')).toBeVisible()
    // Администратору видны и очередь, и админка
    expect(sidebarLink('Проверки')).toBeInTheDocument()
    expect(sidebarLink('Админка')).toBeInTheDocument()
  })

  it('виноградарю объясняет, что очередь не для него', async () => {
    asRole('user')
    server.use(
      http.get('/api/v1/diagnoses/review-queue', () =>
        HttpResponse.json({ detail: 'Недостаточно прав' }, { status: 403 }),
      ),
    )
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Очередь проверок доступна агроному и администратору.',
    )
  })

  it('другие ошибки показывает как есть', async () => {
    asRole('agronomist')
    server.use(
      http.get('/api/v1/diagnoses/review-queue', () =>
        HttpResponse.json({ detail: 'Сервер недоступен' }, { status: 500 }),
      ),
    )
    renderPage()

    expect(await screen.findByRole('alert')).not.toHaveTextContent(
      'доступна агроному',
    )
  })
})
