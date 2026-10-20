import type { Page, Route } from '@playwright/test'

export const CRICOVA = {
  id: 'vineyard-1',
  name: 'Криково, северный склон',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [28.86, 47.14],
          [28.866, 47.14],
          [28.866, 47.143],
          [28.86, 47.143],
          [28.86, 47.14],
        ],
      ],
    ],
  },
  area_ha: 13.6,
  variety: null,
  planting_year: 2015,
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-06-01T10:00:00Z',
}

const corners = [
  [28.8598, 47.1432],
  [28.8662, 47.1432],
  [28.8662, 47.1398],
  [28.8598, 47.1398],
]

function scan(id: string, date: string) {
  const index = { mean: 0.71, min: 0.6, max: 0.8, std: 0.05 }
  return {
    id,
    acquired_at: `${date}T09:17:00Z`,
    platform: 'sentinel-2a',
    scene_cloud_cover: 4,
    parcel_cloud_cover: 0,
    ndvi: index,
    ndre: index,
    ndvi_map: { corners },
  }
}

export const CHECK = {
  id: '3f1c9a0b-7d2e-4f60-9d7e-2c1b8a6f0e11',
  created_at: '2026-06-10T09:30:00Z',
  updated_at: '2026-06-10T09:30:00Z',
  vineyard_id: CRICOVA.id,
  vineyard_name: CRICOVA.name,
  model: 'efficientnet_b0',
  model_version: '82c7cbf32ff86379',
  disease: 'downy_mildew',
  confidence: 0.91,
  top: [
    { disease: 'downy_mildew', probability: 0.91 },
    { disease: 'healthy', probability: 0.06 },
  ],
  severity: 0.18,
  overlays: ['heatmap', 'lesion'],
  location: { lat: 47.1401, lon: 28.86 },
  review: null,
}

// Прозрачный PNG 1 × 1 — картограмма, фото, наложения и плитки подложки
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

export type Api = {
  // Тела запросов на создание участков
  created: unknown[]
  ndviImages: string[]
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, json: body })

// Подмена API бэкенда и плиток подложки: сценарии не зависят ни от сервера,
// ни от сети
export async function mockApi(page: Page): Promise<Api> {
  const api: Api = { created: [], ndviImages: [] }
  const vineyards = [CRICOVA]

  await page.route(
    /^https:\/\/(tile\.openstreetmap\.org|server\.arcgisonline\.com)\//,
    (route) => route.fulfill({ contentType: 'image/png', body: PNG }),
  )
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace('/api/v1', '')
    const method = request.method()

    if (path === '/auth/refresh') {
      return json(route, { access_token: 'access', token_type: 'bearer' })
    }
    if (path === '/users/me') {
      return json(route, {
        id: 'user-1',
        email: 'ion@example.md',
        full_name: 'Ион',
        role: 'agronomist',
        is_active: true,
        created_at: '2026-06-01T00:00:00Z',
        updated_at: '2026-06-01T00:00:00Z',
      })
    }
    if (path === '/vineyards' && method === 'POST') {
      const body = request.postDataJSON() as Record<string, unknown>
      api.created.push(body)
      const created = { ...CRICOVA, ...body, id: 'vineyard-2', area_ha: 2.4 }
      vineyards.push(created)
      return json(route, created, 201)
    }
    if (path === '/vineyards') {
      return json(route, {
        items: vineyards,
        total: vineyards.length,
        page: 1,
        size: 100,
        pages: 1,
      })
    }
    if (/\/vegetation\/[^/]+\/ndvi\.png$/.test(path)) {
      api.ndviImages.push(path)
      return route.fulfill({ contentType: 'image/png', body: PNG })
    }
    if (path.endsWith('/vegetation')) {
      return json(route, [
        scan('june', '2026-06-25'),
        scan('aug', '2026-08-29'),
      ])
    }
    if (path.endsWith('/context')) {
      return json(route, {
        osm_overlap_ratio: 0.42,
        osm_vineyards_within_1km: 8,
        nearest_osm_distance_m: 0,
        district: { iso: 'MD-CU', name: 'Chișinău' },
      })
    }
    if (path === '/weather/current') {
      return json(route, {
        observed_at: '2026-10-16T14:30:00Z',
        temperature_c: 9.6,
        relative_humidity: 71,
        precipitation_mm: 0,
      })
    }
    if (path === '/diagnoses') {
      return json(route, {
        items: [CHECK],
        total: 1,
        page: 1,
        size: 12,
        pages: 1,
      })
    }
    if (/^\/diagnoses\/[^/]+\/(image|overlays\/lesion)$/.test(path)) {
      return route.fulfill({ contentType: 'image/png', body: PNG })
    }
    if (path === '/varieties') return json(route, [])
    if (path === '/osm/vineyards') {
      return json(route, { type: 'FeatureCollection', features: [] })
    }
    if (path === '/risks/today' || path.endsWith('/risks')) {
      return json(route, [])
    }
    return json(route, { detail: `нет подмены для ${method} ${path}` }, 404)
  })
  return api
}
