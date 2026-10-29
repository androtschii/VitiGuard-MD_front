import { readFile } from 'node:fs/promises'
import type { Page, Route } from '@playwright/test'

const MODEL_FILE = new URL('./fixtures/classifier.onnx', import.meta.url)

export const CLASSIFIER = {
  name: 'tiny_test_classifier',
  classes: [
    'healthy',
    'black_rot',
    'esca',
    'leaf_blight',
    'downy_mildew',
    'powdery_mildew',
  ],
  image_size: 32,
  mean: [0, 0, 0],
  std: [1, 1, 1],
  version: 'e2e0000000000001',
  size_bytes: 271,
}

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
export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

export type Api = {
  // Тела запросов на создание участков
  created: unknown[]
  ndviImages: string[]
  // Параметры запросов диагностики
  diagnoses: Record<string, string>[]
  // Тела запросов регистрации и входа
  registered: unknown[]
  logins: unknown[]
  // Скачанные PDF-отчёты участков
  reports: string[]
}

type MockOptions = {
  // Гость: на устройстве ещё не входили, сессию восстанавливать не по чему
  guest?: boolean
  // Новый пользователь: участков пока нет
  empty?: boolean
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, json: body })

// Подмена API бэкенда и плиток подложки: сценарии не зависят ни от сервера,
// ни от сети
export async function mockApi(
  page: Page,
  { guest = false, empty = false }: MockOptions = {},
): Promise<Api> {
  const api: Api = {
    created: [],
    ndviImages: [],
    diagnoses: [],
    registered: [],
    logins: [],
    reports: [],
  }
  // Проверки, сохранённые в этом сценарии: история показывает их, а пока их
  // нет — готовую проверку CHECK
  const saved: (typeof CHECK)[] = []
  const vineyards: Record<string, unknown>[] = empty ? [] : [CRICOVA]

  // Пользователь уже входил на этом устройстве: сессия восстанавливается
  // по refresh-cookie
  if (!guest)
    await page.addInitScript(() =>
      localStorage.setItem('vitiguard.signedIn', '1'),
    )
  // Канал уведомлений открывается и молчит: без подмены прокси Vite пытался
  // бы достучаться до сервера на порту 8000
  await page.routeWebSocket(/\/api\/v1\/ws\/alerts/, () => {})
  await page.route(
    /^https:\/\/(tile\.openstreetmap\.org|server\.arcgisonline\.com)\//,
    (route) => route.fulfill({ contentType: 'image/png', body: PNG }),
  )
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace('/api/v1', '')
    const method = request.method()

    if (path === '/auth/register') {
      const body = request.postDataJSON() as Record<string, unknown>
      api.registered.push(body)
      return json(
        route,
        {
          id: 'user-1',
          email: body.email,
          full_name: body.full_name,
          role: body.role,
          is_active: true,
          telegram_linked: false,
          created_at: '2026-06-01T00:00:00Z',
          updated_at: '2026-06-01T00:00:00Z',
        },
        201,
      )
    }
    if (path === '/auth/login') {
      api.logins.push(request.postDataJSON())
      return json(route, { access_token: 'access', token_type: 'bearer' })
    }
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
        telegram_linked: false,
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
    if (path.endsWith('/vegetation/anomalies')) {
      return json(
        route,
        path.includes(CRICOVA.id)
          ? [
              {
                acquired_at: '2026-08-29T09:17:00Z',
                ndvi: 0.52,
                below_norm: 0.19,
                below_peers: null,
                z: 4.1,
                level: 'suspected',
              },
            ]
          : [],
      )
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
    if (path === '/ai/diagnose') {
      const params = Object.fromEntries(
        new URL(request.url()).searchParams.entries(),
      )
      api.diagnoses.push(params)
      if (params.save === 'true')
        saved.push({
          ...CHECK,
          id: `saved-${saved.length + 1}`,
          created_at: new Date().toISOString(),
          vineyard_id: params.vineyard_id ?? null,
          vineyard_name: params.vineyard_id ? CRICOVA.name : null,
        } as typeof CHECK)
      const overlay = `data:image/png;base64,${PNG.toString('base64')}`
      return json(route, {
        model: CHECK.model,
        disease: CHECK.disease,
        confidence: CHECK.confidence,
        low_confidence: false,
        top: CHECK.top,
        heatmap: overlay,
        lesion: { mask: overlay, severity: 0.18 },
        id: CHECK.id,
        location: null,
      })
    }
    if (path === '/diagnoses') {
      const items = saved.length ? [...saved].reverse() : [CHECK]
      return json(route, {
        items,
        total: items.length,
        page: 1,
        size: 12,
        pages: 1,
      })
    }
    if (/^\/diagnoses\/[^/]+\/(image|overlays\/lesion)$/.test(path)) {
      return route.fulfill({ contentType: 'image/png', body: PNG })
    }
    // Классификатор для диагностики без сети: крошечная настоящая модель
    // ONNX (e2e/fixtures), зелёный снимок она относит к милдью
    if (path === '/ai/models/classifier') {
      return json(route, CLASSIFIER)
    }
    if (path === '/ai/models/classifier/file') {
      return route.fulfill({
        contentType: 'application/octet-stream',
        body: await readFile(MODEL_FILE),
      })
    }
    const report = /^\/vineyards\/([^/]+)\/report\.pdf$/.exec(path)
    if (report) {
      api.reports.push(report[1] ?? '')
      return route.fulfill({
        contentType: 'application/pdf',
        headers: {
          'content-disposition': `attachment; filename="vitiguard-report-${report[1]}.pdf"`,
        },
        body: Buffer.from('%PDF-1.4\n%%EOF\n'),
      })
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
