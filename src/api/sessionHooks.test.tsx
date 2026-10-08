import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '@/store/session'
import { server } from '@/test/server'
import { refreshAccessToken, useLogin, useLogout } from './auth'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('хуки сессии', () => {
  beforeEach(() => {
    useSessionStore.setState(useSessionStore.getInitialState(), true)
  })

  it('вход сохраняет access-токен в хранилище сессии', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper })

    await act(() =>
      result.current.mutateAsync({ email: 'a@b.md', password: 'secret' }),
    )

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'access',
    })
  })

  it('неудачный вход токен не сохраняет', async () => {
    server.use(
      http.post('/api/v1/auth/login', () =>
        HttpResponse.json({ detail: 'Неверный пароль' }, { status: 401 }),
      ),
    )
    const { result } = renderHook(() => useLogin(), { wrapper })

    await act(() =>
      result.current
        .mutateAsync({ email: 'a@b.md', password: 'wrong' })
        .catch(() => undefined),
    )

    expect(useSessionStore.getState().accessToken).toBeNull()
  })

  it('выход очищает сессию и сообщает серверу', async () => {
    let called = false
    server.use(
      http.post('/api/v1/auth/logout', () => {
        called = true
        return HttpResponse.json(null, { status: 204 })
      }),
    )
    useSessionStore.getState().setAccessToken('token')
    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(() => result.current.mutateAsync())

    expect(called).toBe(true)
    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
    })
  })

  it('выход очищает сессию, даже если сервер не ответил', async () => {
    server.use(http.post('/api/v1/auth/logout', () => HttpResponse.error()))
    useSessionStore.getState().setAccessToken('token')
    const { result } = renderHook(() => useLogout(), { wrapper })

    await act(() => result.current.mutateAsync().catch(() => undefined))

    await waitFor(() =>
      expect(useSessionStore.getState().accessToken).toBeNull(),
    )
  })

  it('refreshAccessToken шлёт пустой запрос и возвращает новый токен', async () => {
    let body = 'не вызывался'
    server.use(
      http.post('/api/v1/auth/refresh', async ({ request }) => {
        body = await request.text()
        return HttpResponse.json({ access_token: 'new', token_type: 'bearer' })
      }),
    )

    const result = await refreshAccessToken()

    expect(result.access_token).toBe('new')
    expect(body).toBe('')
  })
})
