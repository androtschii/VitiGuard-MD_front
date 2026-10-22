import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { CurrentUser } from '@/api/users'
import { sidebarLink } from '@/test/nav'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { AdminPage } from './AdminPage'

function account(
  id: string,
  email: string,
  extra: Partial<CurrentUser> = {},
): CurrentUser {
  return {
    id,
    email,
    full_name: null,
    role: 'user',
    is_active: true,
    telegram_linked: false,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    ...extra,
  }
}

const ADMIN = account('admin-1', 'admin@vitiguard.md', {
  role: 'admin',
  full_name: 'Админ',
})

function setup(users: CurrentUser[], pages = 1) {
  const requests: URLSearchParams[] = []
  const changes: unknown[] = []
  let stored = users
  server.use(
    http.get('/api/v1/users/me', () => HttpResponse.json(ADMIN)),
    http.get('/api/v1/admin/users', ({ request }) => {
      const params = new URL(request.url).searchParams
      requests.push(params)
      const q = params.get('q') ?? ''
      const items = stored.filter((user) => user.email.includes(q))
      return HttpResponse.json({
        items,
        total: items.length,
        page: Number(params.get('page')),
        size: 20,
        pages,
      })
    }),
    http.patch('/api/v1/admin/users/:id', async ({ params, request }) => {
      const change = (await request.json()) as Partial<CurrentUser>
      changes.push({ id: params.id, ...change })
      stored = stored.map((user) =>
        user.id === params.id ? { ...user, ...change } : user,
      )
      return HttpResponse.json(stored.find((user) => user.id === params.id))
    }),
  )
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/admin']}>
      <AdminPage />
    </MemoryRouter>,
  )
  return { requests, changes, user: userEvent.setup() }
}

describe('AdminPage', () => {
  it('администратор видит раздел и меняет роль пользователя', async () => {
    const { changes, user } = setup([
      ADMIN,
      account('user-1', 'ion@example.md', { full_name: 'Ион' }),
    ])

    const role = await screen.findByLabelText('Роль ion@example.md')
    expect(sidebarLink('Админка')).toHaveAttribute('aria-current', 'page')
    // Свою роль администратор не меняет
    expect(screen.getByLabelText('Роль admin@vitiguard.md')).toBeDisabled()

    await user.selectOptions(role, 'agronomist')

    expect(changes).toEqual([{ id: 'user-1', role: 'agronomist' }])
    await waitFor(() =>
      expect(screen.getByLabelText('Роль ion@example.md')).toHaveValue(
        'agronomist',
      ),
    )
  })

  it('блокирует и разблокирует, но не себя', async () => {
    const { changes, user } = setup([
      ADMIN,
      account('user-1', 'ion@example.md'),
    ])

    await user.click(
      await screen.findByRole('button', {
        name: 'Заблокировать ion@example.md',
      }),
    )
    const row = (await screen.findByText('Заблокирован')).closest('tr')
    expect(row).not.toBeNull()
    await user.click(
      within(row as HTMLElement).getByRole('button', {
        name: 'Разблокировать ion@example.md',
      }),
    )

    expect(changes).toEqual([
      { id: 'user-1', is_active: false },
      { id: 'user-1', is_active: true },
    ])
    expect(
      screen.queryByRole('button', { name: /admin@vitiguard\.md/ }),
    ).toBeNull()
  })

  it('ищет по email и листает страницы', async () => {
    const { requests, user } = setup(
      [ADMIN, account('user-1', 'ion@example.md')],
      3,
    )
    await screen.findByLabelText('Роль ion@example.md')

    await user.click(screen.getByRole('button', { name: 'Страница 2' }))
    await waitFor(() => expect(requests.at(-1)?.get('page')).toBe('2'))
    await user.type(screen.getByLabelText('Поиск по email и имени'), 'ion')

    await waitFor(() => expect(requests.at(-1)?.get('q')).toBe('ion'))
    // Новый поиск — снова с первой страницы
    expect(requests.at(-1)?.get('page')).toBe('1')
    await waitFor(() =>
      expect(screen.queryByLabelText('Роль admin@vitiguard.md')).toBeNull(),
    )
  })

  it('пустой результат и ошибки сервера', async () => {
    const { user } = setup([ADMIN])
    await screen.findByLabelText('Роль admin@vitiguard.md')
    await user.type(screen.getByLabelText('Поиск по email и имени'), 'nobody')

    expect(await screen.findByText('Никого не найдено.')).toBeInTheDocument()
  })

  it('без прав — ответ сервера', async () => {
    server.use(
      http.get('/api/v1/admin/users', () =>
        HttpResponse.json({ detail: 'Недостаточно прав' }, { status: 403 }),
      ),
    )
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Недостаточно прав',
    )
  })

  it('показывает, если изменение не прошло', async () => {
    const { user } = setup([ADMIN, account('user-1', 'ion@example.md')])
    server.use(
      http.patch('/api/v1/admin/users/:id', () =>
        HttpResponse.json(
          { detail: 'Пользователь не найден' },
          { status: 404 },
        ),
      ),
    )

    await user.click(
      await screen.findByRole('button', {
        name: 'Заблокировать ion@example.md',
      }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Пользователь не найден',
    )
  })
})
