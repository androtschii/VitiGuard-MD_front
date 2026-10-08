import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api, setTokenProvider, setUnauthorizedHandler } from '@/api/client'
import { useSessionStore } from '@/store/session'
import { server } from '@/test/server'
import { initSession, refreshSession } from './session'

const unauthorized = () =>
  HttpResponse.json({ detail: 'Не авторизован' }, { status: 401 })

function mockRefresh(token: string) {
  const calls = { count: 0 }
  server.use(
    http.post('/api/v1/auth/refresh', () => {
      calls.count += 1
      return HttpResponse.json({ access_token: token, token_type: 'bearer' })
    }),
  )
  return calls
}

// Защищённый запрос: пропускает только токен «fresh»
function mockProtected() {
  const seen: (string | null)[] = []
  server.use(
    http.get('/api/v1/users/me', ({ request }) => {
      const authorization = request.headers.get('Authorization')
      seen.push(authorization)
      return authorization === 'Bearer fresh'
        ? HttpResponse.json({ email: 'grower@example.md' })
        : unauthorized()
    }),
  )
  return seen
}

// Состояние «страница открыта давно, access-токен уже просрочен»
function connectWithExpiredToken() {
  setTokenProvider(() => useSessionStore.getState().accessToken)
  setUnauthorizedHandler(refreshSession)
  useSessionStore.getState().setAccessToken('expired')
}

describe('сессия', () => {
  beforeEach(() => {
    useSessionStore.setState(useSessionStore.getInitialState(), true)
  })

  afterEach(() => {
    setTokenProvider(() => null)
    setUnauthorizedHandler(null)
  })

  describe('восстановление при запуске', () => {
    it('получает токен по refresh-cookie и подставляет его в запросы', async () => {
      mockRefresh('fresh')
      const seen = mockProtected()

      await initSession()
      await api.get('/users/me')

      expect(useSessionStore.getState()).toMatchObject({
        status: 'authenticated',
        accessToken: 'fresh',
      })
      expect(seen).toEqual(['Bearer fresh'])
    })

    it('пока идёт запрос, состояние неизвестно', async () => {
      mockRefresh('fresh')

      const restoring = initSession()
      expect(useSessionStore.getState().status).toBe('unknown')

      await restoring
    })

    it('без действующей cookie пользователь анонимен', async () => {
      server.use(http.post('/api/v1/auth/refresh', unauthorized))

      await initSession()

      expect(useSessionStore.getState()).toMatchObject({
        status: 'anonymous',
        accessToken: null,
      })
    })

    it('если сервер недоступен, пользователь анонимен', async () => {
      server.use(http.post('/api/v1/auth/refresh', () => HttpResponse.error()))

      await initSession()

      expect(useSessionStore.getState().status).toBe('anonymous')
    })
  })

  describe('обновление токена при 401', () => {
    it('повторяет запрос с новым токеном', async () => {
      const refresh = mockRefresh('fresh')
      const seen = mockProtected()
      connectWithExpiredToken()

      const { data } = await api.get<{ email: string }>('/users/me')

      expect(data.email).toBe('grower@example.md')
      expect(seen).toEqual(['Bearer expired', 'Bearer fresh'])
      expect(refresh.count).toBe(1)
      expect(useSessionStore.getState().accessToken).toBe('fresh')
    })

    it('параллельные 401 обновляют токен одним запросом', async () => {
      const refresh = mockRefresh('fresh')
      mockProtected()
      connectWithExpiredToken()

      const responses = await Promise.all([
        api.get('/users/me'),
        api.get('/users/me'),
        api.get('/users/me'),
      ])

      expect(responses.map((r) => r.status)).toEqual([200, 200, 200])
      expect(refresh.count).toBe(1)
    })

    it('если обновить токен не удалось, запрос получает 401 и сессия очищается', async () => {
      server.use(http.post('/api/v1/auth/refresh', unauthorized))
      mockProtected()
      connectWithExpiredToken()

      await expect(api.get('/users/me')).rejects.toMatchObject({
        name: 'ApiError',
        status: 401,
      })
      expect(useSessionStore.getState()).toMatchObject({
        status: 'anonymous',
        accessToken: null,
      })
    })

    it('при постоянном 401 повторяет запрос только один раз', async () => {
      const refresh = mockRefresh('fresh')
      let requests = 0
      server.use(
        http.get('/api/v1/users/me', () => {
          requests += 1
          return unauthorized()
        }),
      )
      connectWithExpiredToken()

      await expect(api.get('/users/me')).rejects.toMatchObject({ status: 401 })

      expect(requests).toBe(2)
      expect(refresh.count).toBe(1)
    })

    it('ошибка самого входа не запускает обновление токена', async () => {
      const refresh = mockRefresh('fresh')
      server.use(http.post('/api/v1/auth/login', unauthorized))
      connectWithExpiredToken()

      await expect(
        api.post('/auth/login', { email: 'a@b.md', password: 'x' }),
      ).rejects.toMatchObject({ status: 401 })

      expect(refresh.count).toBe(0)
    })

    it('без подключённого обработчика 401 просто возвращается ошибкой', async () => {
      const refresh = mockRefresh('fresh')
      mockProtected()

      await expect(api.get('/users/me')).rejects.toMatchObject({ status: 401 })

      expect(refresh.count).toBe(0)
    })
  })
})
