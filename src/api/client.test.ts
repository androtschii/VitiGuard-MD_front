import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { server } from '@/test/server'
import { api, ApiError, setTokenProvider } from './client'

describe('api', () => {
  afterEach(() => setTokenProvider(() => null))

  it('добавляет токен в заголовок Authorization', async () => {
    let authorization: string | null = null
    server.use(
      http.get('/api/v1/users/me', ({ request }) => {
        authorization = request.headers.get('Authorization')
        return HttpResponse.json({})
      }),
    )
    setTokenProvider(() => 'secret-token')

    await api.get('/users/me')

    expect(authorization).toBe('Bearer secret-token')
  })

  it('берёт текст ошибки из поля detail', async () => {
    server.use(
      http.get('/api/v1/vineyards/42', () =>
        HttpResponse.json({ detail: 'Участок не найден' }, { status: 404 }),
      ),
    )

    const error = await api.get('/vineyards/42').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ message: 'Участок не найден', status: 404 })
  })

  it('сообщает, что сервер недоступен', async () => {
    server.use(http.get('/api/v1/info', () => HttpResponse.error()))

    const error = await api.get('/info').catch((e: unknown) => e)

    expect(error).toMatchObject({ message: 'Сервер недоступен', status: null })
  })

  it('извлекает текст ошибки detail из Blob-ответа', async () => {
    server.use(
      // Ответ — обычный JSON: с responseType: 'blob' axios отдаёт его как Blob,
      // как сервер отдаёт ошибку вместо файла
      http.get('/api/v1/blob-error', () =>
        HttpResponse.json(
          { detail: 'Ошибка в бинарном запросе' },
          { status: 400 },
        ),
      ),
    )

    const error = await api
      .get('/blob-error', { responseType: 'blob' })
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      message: 'Ошибка в бинарном запросе',
      status: 400,
    })
  })
})
