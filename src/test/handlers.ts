import { http, HttpResponse } from 'msw'
import type { ApiInfo } from '@/api/info'

export const apiInfo: ApiInfo = {
  name: 'VitiGuard MD API',
  version: '0.1.0',
  environment: 'test',
}

export const handlers = [
  http.get('/api/v1/info', () => HttpResponse.json(apiInfo)),
]
