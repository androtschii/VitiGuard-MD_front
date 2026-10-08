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

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Имя/), 'Андрей Бахов')
  await user.type(screen.getByLabelText(/Email/), 'grower@example.md')
  await user.type(screen.getByLabelText(/^Пароль/), 'secret123')
  await user.type(screen.getByLabelText(/Повторите пароль/), 'secret123')
  await user.selectOptions(screen.getByRole('combobox'), 'agronomist')
  await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
}

describe('RegisterPage', () => {
  it('отправляет серверу данные без подтверждения пароля', async () => {
    let body: unknown
    server.use(
      http.post('/api/v1/auth/register', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const { user } = renderAt('/register')

    await fillAndSubmit(user)

    await screen.findByRole('heading', { name: 'Вход' })
    expect(body).toEqual({
      email: 'grower@example.md',
      password: 'secret123',
      full_name: 'Андрей Бахов',
      role: 'agronomist',
    })
  })

  it('после регистрации ведёт на вход с сообщением', async () => {
    const { router, user } = renderAt('/register')

    await fillAndSubmit(user)

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Аккаунт создан',
    )
    expect(router.state.location.pathname).toBe('/login')
  })

  it('занятый email оставляет на странице и показывает ошибку у поля', async () => {
    server.use(
      http.post('/api/v1/auth/register', () =>
        HttpResponse.json({ detail: 'Запись уже есть' }, { status: 409 }),
      ),
    )
    const { router, user } = renderAt('/register')

    await fillAndSubmit(user)

    expect(
      await screen.findByText('Пользователь с таким email уже зарегистрирован'),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/register')
  })

  it('со страницы входа ссылка ведёт на регистрацию и обратно', async () => {
    const { router, user } = renderAt('/login')

    await user.click(screen.getByRole('link', { name: 'Зарегистрироваться' }))
    expect(router.state.location.pathname).toBe('/register')

    await user.click(screen.getByRole('link', { name: 'Войти' }))
    expect(router.state.location.pathname).toBe('/login')
  })

  it('без регистрации сообщение «Аккаунт создан» не показывается', () => {
    renderAt('/login')

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
