import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { tokens } from '@/test/handlers'
import { server } from '@/test/server'
import { login } from './auth'

describe('login', () => {
  it('отправляет email и пароль JSON-ом и возвращает токены', async () => {
    let body: unknown
    server.use(
      http.post('/api/v1/auth/login', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(tokens)
      }),
    )

    const result = await login({
      email: 'grower@example.md',
      password: 'secret',
    })

    expect(body).toEqual({ email: 'grower@example.md', password: 'secret' })
    expect(result).toEqual(tokens)
  })

  it('превращает ошибку сервера в ApiError с его текстом', async () => {
    server.use(
      http.post('/api/v1/auth/login', () =>
        HttpResponse.json(
          { detail: 'Неверный email или пароль' },
          { status: 401 },
        ),
      ),
    )

    await expect(
      login({ email: 'grower@example.md', password: 'wrong' }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Неверный email или пароль',
    })
  })
})
