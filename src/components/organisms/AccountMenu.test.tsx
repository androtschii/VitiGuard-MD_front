import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { listAccounts, rememberAccount } from '@/lib/accounts'
import { useSessionStore } from '@/store/session'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { AccountMenu } from './AccountMenu'

function renderMenu() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <AccountMenu /> },
      { path: '/profile', element: <p>Страница профиля</p> },
      { path: '/login', element: <p>Страница входа</p> },
    ],
    { initialEntries: ['/'] },
  )
  renderWithQueryClient(<RouterProvider router={router} />)
  return { router, user: userEvent.setup() }
}

afterEach(() => {
  localStorage.clear()
})

describe('AccountMenu', () => {
  it('показывает, кто вошёл, и запоминает аккаунт на устройстве', async () => {
    const { user } = renderMenu()

    const toggle = await screen.findByRole('button', { name: 'Меню профиля' })
    await waitFor(() => expect(toggle).toHaveTextContent('Ион'))
    expect(listAccounts()).toEqual([
      { email: 'ion@example.md', name: 'Ион', role: 'user' },
    ])

    await user.click(toggle)
    const menu = screen.getByRole('menu', { name: 'Меню профиля' })
    expect(within(menu).getByText('ion@example.md')).toBeVisible()
    expect(within(menu).getByText('Виноградарь')).toBeVisible()
    // Других аккаунтов нет — заголовка переключения тоже нет
    expect(within(menu).queryByText('Сменить аккаунт')).toBeNull()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(toggle).toHaveFocus()
  })

  it('ведёт в профиль', async () => {
    const { router, user } = renderMenu()

    await user.click(
      await screen.findByRole('button', { name: 'Меню профиля' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Профиль' }))

    expect(router.state.location.pathname).toBe('/profile')
  })

  it('переключает на другой аккаунт: выход и вход с подставленным email', async () => {
    rememberAccount({
      email: 'maria@example.md',
      name: 'Мария',
      role: 'agronomist',
    })
    let loggedOut = false
    server.use(
      http.post('/api/v1/auth/logout', () => {
        loggedOut = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    useSessionStore.getState().setAccessToken('token')
    const { router, user } = renderMenu()

    await user.click(
      await screen.findByRole('button', { name: 'Меню профиля' }),
    )
    const menu = screen.getByRole('menu')
    expect(within(menu).getByText('Сменить аккаунт')).toBeVisible()
    await user.click(within(menu).getByRole('menuitem', { name: /Мария/ }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toEqual({ email: 'maria@example.md' })
    expect(loggedOut).toBe(true)
    expect(useSessionStore.getState().accessToken).toBeNull()
  })

  it('«Войти в другой аккаунт» открывает пустой вход', async () => {
    const { router, user } = renderMenu()

    await user.click(
      await screen.findByRole('button', { name: 'Меню профиля' }),
    )
    await user.click(
      screen.getByRole('menuitem', { name: 'Войти в другой аккаунт' }),
    )

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toBeNull()
  })

  it('аккаунт можно убрать из списка, а меню закрывается кликом мимо', async () => {
    rememberAccount({ email: 'admin@example.md', name: null, role: 'admin' })
    const { user } = renderMenu()

    await user.click(
      await screen.findByRole('button', { name: 'Меню профиля' }),
    )
    expect(
      screen.getByRole('menuitem', {
        name: /Администратор · admin@example\.md/,
      }),
    ).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Убрать admin@example.md из списка' }),
    )

    expect(screen.queryByText('admin@example.md')).toBeNull()
    expect(listAccounts().map((item) => item.email)).toEqual(['ion@example.md'])

    await user.click(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('выходит из аккаунта', async () => {
    useSessionStore.getState().setAccessToken('token')
    const { user } = renderMenu()

    await user.click(
      await screen.findByRole('button', { name: 'Меню профиля' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Выйти' }))

    await waitFor(() =>
      expect(useSessionStore.getState().accessToken).toBeNull(),
    )
  })
})
