import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as mapImage from '@/lib/mapImage'
import { useSessionStore } from '@/store/session'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { AccountDataSection } from './AccountDataSection'

function renderSection() {
  const router = createMemoryRouter(
    [
      { path: '/profile', element: <AccountDataSection /> },
      { path: '/welcome', element: <p>Главная для гостя</p> },
    ],
    { initialEntries: ['/profile'] },
  )
  renderWithQueryClient(<RouterProvider router={router} />)
  return { router, user: userEvent.setup() }
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Удалить аккаунт' }))
  return screen.getByLabelText('Текущий пароль')
}

beforeEach(() => {
  vi.spyOn(mapImage, 'saveBlob').mockImplementation(() => {})
  useSessionStore.getState().setAccessToken('token')
})

afterEach(() => {
  vi.restoreAllMocks()
  useSessionStore.getState().clear()
})

describe('AccountDataSection', () => {
  it('скачивает свои данные файлом с именем от сервера', async () => {
    const { user } = renderSection()

    await user.click(screen.getByRole('button', { name: 'Скачать мои данные' }))

    await expect
      .poll(() => vi.mocked(mapImage.saveBlob).mock.calls.length)
      .toBe(1)
    expect(vi.mocked(mapImage.saveBlob).mock.calls[0]?.[1]).toBe(
      'vitiguard-data-2026-06-10.json',
    )
  })

  it('на слишком частую выгрузку просит подождать', async () => {
    server.use(
      http.get('/api/v1/users/me/export', () =>
        HttpResponse.json(
          { detail: 'Слишком много запросов' },
          { status: 429 },
        ),
      ),
    )
    const { user } = renderSection()

    await user.click(screen.getByRole('button', { name: 'Скачать мои данные' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Слишком часто. Попробуйте через минуту.',
    )
  })

  it('прочая ошибка выгрузки — общее сообщение', async () => {
    server.use(
      http.get('/api/v1/users/me/export', () =>
        HttpResponse.json({ detail: 'Сбой' }, { status: 500 }),
      ),
    )
    const { user } = renderSection()

    await user.click(screen.getByRole('button', { name: 'Скачать мои данные' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось скачать данные',
    )
  })

  it('удаляет аккаунт по паролю, закрывает сессию и уводит на главную гостя', async () => {
    const bodies: unknown[] = []
    server.use(
      http.delete('/api/v1/users/me', async ({ request }) => {
        bodies.push(await request.json())
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { router, user } = renderSection()

    const password = await openDialog(user)
    const confirm = screen.getByRole('button', { name: 'Удалить навсегда' })
    expect(confirm).toBeDisabled()
    await user.type(password, 'секрет-123')
    await user.click(confirm)

    await expect.poll(() => router.state.location.pathname).toBe('/welcome')
    expect(bodies).toEqual([{ password: 'секрет-123' }])
    expect(useSessionStore.getState().accessToken).toBeNull()
  })

  it.each([
    [401, 'Неверный пароль.'],
    [409, 'Нельзя удалить последнего администратора.'],
    [500, 'Не удалось удалить аккаунт'],
  ])('ошибка %i показывается в диалоге', async (status, text) => {
    server.use(
      http.delete('/api/v1/users/me', () =>
        HttpResponse.json({ detail: 'Ошибка сервера' }, { status }),
      ),
    )
    const { router, user } = renderSection()

    await user.type(await openDialog(user), 'пароль')
    await user.click(screen.getByRole('button', { name: 'Удалить навсегда' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(text)
    expect(router.state.location.pathname).toBe('/profile')
    expect(useSessionStore.getState().accessToken).toBe('token')
  })

  it('отмена закрывает диалог и забывает пароль', async () => {
    server.use(
      http.delete('/api/v1/users/me', async () => {
        await delay(50)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { user } = renderSection()

    await user.type(await openDialog(user), 'пароль')
    await user.click(screen.getByRole('button', { name: 'Отмена' }))
    const password = await openDialog(user)

    expect(password).toHaveValue('')
  })
})
