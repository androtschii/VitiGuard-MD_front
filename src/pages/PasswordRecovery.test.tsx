import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from '@/app/routes'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  renderWithQueryClient(<RouterProvider router={router} />)
  return { router, user: userEvent.setup() }
}

describe('запрос ссылки для сброса пароля', () => {
  it('со страницы входа ссылка «Забыли пароль?» ведёт на восстановление', async () => {
    const { router, user } = renderAt('/login')

    await user.click(screen.getByRole('link', { name: 'Забыли пароль?' }))

    expect(router.state.location.pathname).toBe('/forgot-password')
    expect(
      screen.getByRole('heading', { name: 'Восстановление пароля' }),
    ).toBeInTheDocument()
  })

  it('отправляет email и сообщает, что письмо отправлено', async () => {
    let body: unknown
    server.use(
      http.post('/api/v1/auth/password-reset', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(null, { status: 202 })
      }),
    )
    const { user } = renderAt('/forgot-password')

    await user.type(screen.getByLabelText(/Email/), 'grower@example.md')
    await user.click(screen.getByRole('button', { name: 'Отправить ссылку' }))

    const status = await screen.findByRole('status')
    expect(body).toEqual({ email: 'grower@example.md' })
    expect(status).toHaveTextContent('Если аккаунт с адресом grower@example.md')
    expect(
      screen.queryByRole('button', { name: 'Отправить ссылку' }),
    ).toBeNull()
  })

  it('неверный email не отправляется', async () => {
    const { user } = renderAt('/forgot-password')

    await user.type(screen.getByLabelText(/Email/), 'grower')
    await user.click(screen.getByRole('button', { name: 'Отправить ссылку' }))

    expect(
      await screen.findByText('Введите корректный email'),
    ).toBeInTheDocument()
  })

  it('при ошибке сервера остаётся форма и показывается причина', async () => {
    server.use(
      http.post('/api/v1/auth/password-reset', () =>
        HttpResponse.json(
          { detail: 'Сервис почты недоступен' },
          { status: 503 },
        ),
      ),
    )
    const { user } = renderAt('/forgot-password')

    await user.type(screen.getByLabelText(/Email/), 'grower@example.md')
    await user.click(screen.getByRole('button', { name: 'Отправить ссылку' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сервис почты недоступен',
    )
    expect(
      screen.getByRole('button', { name: 'Отправить ссылку' }),
    ).toBeInTheDocument()
  })
})

describe('установка нового пароля', () => {
  async function fillAndSubmit(
    user: ReturnType<typeof userEvent.setup>,
    confirm = 'secret123',
  ) {
    await user.type(screen.getByLabelText(/Новый пароль/), 'secret123')
    await user.type(screen.getByLabelText(/Повторите пароль/), confirm)
    await user.click(screen.getByRole('button', { name: 'Сохранить пароль' }))
  }

  it('без ключа в адресе предлагает запросить новую ссылку', () => {
    renderAt('/reset-password')

    expect(
      screen.getByRole('heading', { name: 'Ссылка недействительна' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'запросите новую' }),
    ).toHaveAttribute('href', '/forgot-password')
  })

  it('отправляет ключ из адреса и новый пароль, затем ведёт на вход', async () => {
    let body: unknown
    server.use(
      http.post('/api/v1/auth/password-reset/confirm', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(null, { status: 204 })
      }),
    )
    const { router, user } = renderAt('/reset-password?token=abc123')

    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Пароль изменён',
    )
    expect(body).toEqual({ token: 'abc123', new_password: 'secret123' })
    expect(router.state.location.pathname).toBe('/login')
  })

  it('несовпадающие пароли не отправляются', async () => {
    const { user } = renderAt('/reset-password?token=abc123')

    await fillAndSubmit(user, 'secret124')

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument()
  })

  it('устаревшая ссылка показывает ответ сервера и ссылку на новый запрос', async () => {
    server.use(
      http.post('/api/v1/auth/password-reset/confirm', () =>
        HttpResponse.json({ detail: 'Ссылка устарела' }, { status: 400 }),
      ),
    )
    const { router, user } = renderAt('/reset-password?token=old')

    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ссылка устарела',
    )
    expect(router.state.location.pathname).toBe('/reset-password')
    expect(
      screen.getByRole('link', { name: 'Запросить новую ссылку' }),
    ).toBeInTheDocument()
  })
})
