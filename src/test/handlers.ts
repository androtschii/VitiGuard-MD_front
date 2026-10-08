import { http, HttpResponse } from 'msw'
import type { TokenPair } from '@/api/auth'
import type { ApiInfo } from '@/api/info'

export const apiInfo: ApiInfo = {
  name: 'VitiGuard MD API',
  version: '0.1.0',
  environment: 'test',
}

export const tokens: TokenPair = {
  access_token: 'access',
  refresh_token: 'refresh',
  token_type: 'bearer',
}

export const handlers = [
  http.get('/api/v1/info', () => HttpResponse.json(apiInfo)),
  http.post('/api/v1/auth/login', () => HttpResponse.json(tokens)),
]
