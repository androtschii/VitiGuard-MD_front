import { http, HttpResponse } from 'msw'
import type { AccessToken } from '@/api/auth'
import type { Diagnosis } from '@/api/diagnosis'
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

export const diagnosis: Diagnosis = {
  model: 'efficientnet_b0',
  disease: 'powdery_mildew',
  confidence: 0.9312,
  low_confidence: false,
  top: [
    { disease: 'powdery_mildew', probability: 0.9312 },
    { disease: 'downy_mildew', probability: 0.0411 },
    { disease: 'healthy', probability: 0.0156 },
    { disease: 'leaf_blight', probability: 0.0067 },
    { disease: 'esca', probability: 0.0034 },
    { disease: 'black_rot', probability: 0.002 },
  ],
  heatmap: 'data:image/png;base64,aGVhdG1hcA==',
  lesion: { mask: 'data:image/png;base64,bWFzaw==', severity: 0.18 },
}

export const handlers = [
  http.post('/api/v1/ai/diagnose', () => HttpResponse.json(diagnosis)),
  http.get('/api/v1/varieties', () =>
    HttpResponse.json([
      { id: 'merlot', name: 'Merlot', berry_color: 'red' },
      { id: 'feteasca-neagra', name: 'Fetească Neagră', berry_color: 'red' },
    ]),
  ),
  http.get('/api/v1/vineyards/:id/context', () =>
    HttpResponse.json({
      osm_overlap_ratio: 0.42,
      osm_vineyards_within_1km: 8,
      nearest_osm_distance_m: 27.4,
      district: { iso: 'MD-CU', name: 'Chișinău' },
    }),
  ),
  http.get('/api/v1/vineyards/:id/risks', () => HttpResponse.json([])),
  http.get('/api/v1/risks/today', () => HttpResponse.json([])),
  http.get('/api/v1/weather/current', () =>
    HttpResponse.json({
      observed_at: '2026-10-16T14:30:00Z',
      temperature_c: 9.6,
      relative_humidity: 71,
      precipitation_mm: 0,
    }),
  ),
  http.get('/api/v1/osm/vineyards', () =>
    HttpResponse.json({ type: 'FeatureCollection', features: [] }),
  ),
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
        area_ha: 1.69,
        variety: null,
        planting_year: body.planting_year ?? null,
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
