import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { apiInfo } from '@/test/handlers'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { useSessionStore } from '@/store/session'
import { DemoLogin } from './DemoLogin'

function info(demo: boolean) {
  server.use(
    http.get('/api/v1/info', () =>
      HttpResponse.json({ ...apiInfo, demo_login: demo }),
    ),
  )
}

afterEach(() => {
  useSessionStore.getState().clear()
})

describe('DemoLogin', () => {
  it('входит в выбранную роль одним нажатием', async () => {
    info(true)
    const roles: string[] = []
    server.use(
      http.post('/api/v1/auth/demo', async ({ request }) => {
        roles.push(((await request.json()) as { role: string }).role)
        return HttpResponse.json({ access_token: 'demo', token_type: 'bearer' })
      }),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<DemoLogin />)

    expect(
      await screen.findByRole('heading', { name: 'Демо-вход' }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Виноградарь' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Администратор' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Агроном' }))

    await expect.poll(() => useSessionStore.getState().accessToken).toBe('demo')
    expect(roles).toEqual(['agronomist'])
  })

  it('без включённого демо-входа ничего не показывает', async () => {
    info(false)
    const { container } = renderWithQueryClient(<DemoLogin />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container).toBeEmptyDOMElement()
  })

  it('показывает ошибку, если аккаунта роли нет', async () => {
    info(true)
    server.use(
      http.post('/api/v1/auth/demo', () =>
        HttpResponse.json(
          { detail: 'Демо-аккаунт этой роли не создан' },
          { status: 404 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<DemoLogin />)

    await user.click(await screen.findByRole('button', { name: 'Виноградарь' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Демо-аккаунт этой роли не создан',
    )
  })

  it('пока идёт вход, нажатая кнопка ждёт, остальные недоступны', async () => {
    info(true)
    server.use(
      http.post('/api/v1/auth/demo', async () => {
        await delay(200)
        return HttpResponse.json({ access_token: 'demo', token_type: 'bearer' })
      }),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<DemoLogin />)

    await user.click(await screen.findByRole('button', { name: 'Агроном' }))

    expect(screen.getByRole('button', { name: /Агроном/ })).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Виноградарь' })).toBeDisabled()
  })
})
