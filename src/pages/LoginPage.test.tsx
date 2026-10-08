import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from '@/app/routes'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'

function renderLogin() {
  const router = createMemoryRouter(routes, { initialEntries: ['/login'] })
  renderWithQueryClient(<RouterProvider router={router} />)
  return { router, user: userEvent.setup() }
}

describe('LoginPage', () => {
  it('показывает форму входа', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('после успешного входа переходит на главную', async () => {
    const { router, user } = renderLogin()

    await user.type(screen.getByLabelText(/Email/), 'grower@example.md')
    await user.type(screen.getByLabelText(/Пароль/), 'secret')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(
      await screen.findByRole('heading', { name: 'VitiGuard MD' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('при отказе сервера остаётся на странице и показывает причину', async () => {
    server.use(
      http.post('/api/v1/auth/login', () =>
        HttpResponse.json(
          { detail: 'Неверный email или пароль' },
          { status: 401 },
        ),
      ),
    )
    const { router, user } = renderLogin()

    await user.type(screen.getByLabelText(/Email/), 'grower@example.md')
    await user.type(screen.getByLabelText(/Пароль/), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Неверный email или пароль',
    )
    expect(router.state.location.pathname).toBe('/login')
  })
})
