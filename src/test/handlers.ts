import { http, HttpResponse } from 'msw'
import type { AccessToken } from '@/api/auth'
import type { ApiInfo } from '@/api/info'

export const apiInfo: ApiInfo = {
  name: 'VitiGuard MD API',
  version: '0.1.0',
  environment: 'test',
}

export const tokens: AccessToken = {
  access_token: 'access',
  token_type: 'bearer',
}

export const handlers = [
  http.get('/api/v1/vineyards', () =>
    HttpResponse.json({ items: [], total: 0, page: 1, size: 100, pages: 0 }),
  ),
  http.post('/api/v1/vineyards', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        id: 'vineyard-1',
        name: body.name,
        geometry: body.geometry,
        created_at: '2026-10-12T10:00:00Z',
        updated_at: '2026-10-12T10:00:00Z',
      },
      { status: 201 },
    )
  }),
  http.get('/api/v1/info', () => HttpResponse.json(apiInfo)),
  http.post('/api/v1/auth/login', () => HttpResponse.json(tokens)),
  http.post('/api/v1/auth/refresh', () => HttpResponse.json(tokens)),
  http.post('/api/v1/auth/logout', () =>
    HttpResponse.json(null, { status: 204 }),
  ),
  http.post('/api/v1/auth/password-reset', () =>
    HttpResponse.json(null, { status: 202 }),
  ),
  http.post('/api/v1/auth/password-reset/confirm', () =>
    HttpResponse.json(null, { status: 204 }),
  ),
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    return HttpResponse.json(
      {
        id: 'user-1',
        email: body.email,
        full_name: body.full_name,
        role: body.role,
      },
      { status: 201 },
    )
  }),
]
