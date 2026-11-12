import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import { vineyardPoint } from '@/lib/vineyardPoint'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { WeatherToday } from './WeatherToday'

const square: Vineyard['geometry'] = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [28.8, 47.1],
        [28.9, 47.1],
        [28.9, 47.2],
        [28.8, 47.2],
        [28.8, 47.1],
      ],
    ],
  ],
}

function vineyards(items: Partial<Vineyard>[]) {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: items.map((item, index) => ({
          id: `v${index}`,
          name: 'Криково',
          geometry: square,
          area_ha: 8,
          variety_id: null,
          planting_year: null,
          created_at: '2026-06-01T00:00:00Z',
          updated_at: '2026-06-01T00:00:00Z',
          ...item,
        })),
        total: items.length,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
  )
}

function weather(humidity: number, temperature = 18) {
  const asked: string[] = []
  server.use(
    http.get('/api/v1/weather/current', ({ request }) => {
      const query = new URL(request.url).searchParams
      asked.push(`${query.get('latitude')},${query.get('longitude')}`)
      return HttpResponse.json({
        observed_at: '2026-11-12T10:00:00Z',
        temperature_c: temperature,
        relative_humidity: humidity,
        precipitation_mm: 1.25,
      })
    }),
  )
  return asked
}

describe('vineyardPoint', () => {
  it('берёт середину контура без повторённой последней точки', () => {
    const [lon, lat] = vineyardPoint({ geometry: square } as Vineyard) ?? []
    expect(lon).toBeCloseTo(28.85)
    expect(lat).toBeCloseTo(47.15)
  })

  it('пустой контур — точки нет', () => {
    const empty = { type: 'MultiPolygon', coordinates: [] }
    expect(vineyardPoint({ geometry: empty } as unknown as Vineyard)).toBeNull()
    const one = { type: 'MultiPolygon', coordinates: [[[[28.8, 47.1]]]] }
    expect(vineyardPoint({ geometry: one } as unknown as Vineyard)).toEqual([
      28.8, 47.1,
    ])
  })
})

describe('WeatherToday', () => {
  it('показывает погоду у первого участка и предупреждает о сырости', async () => {
    vineyards([{ name: 'Криково' }])
    const asked = weather(91)
    renderWithQueryClient(<WeatherToday />)

    expect(
      await screen.findByRole('heading', {
        name: 'Погода сейчас у участка «Криково»',
      }),
    ).toBeVisible()
    expect(await screen.findByText('18 °C')).toBeVisible()
    expect(screen.getByText('влажность 91 %')).toBeVisible()
    expect(screen.getByText('осадки 1,3 мм')).toBeVisible()
    expect(screen.getByText(/условия для заражения милдью/)).toBeVisible()
    expect(asked).toEqual(['47.15,28.85'])
  })

  it('сухо или холодно — условий для заражения нет', async () => {
    vineyards([{}])
    weather(60)
    renderWithQueryClient(<WeatherToday />)

    expect(
      await screen.findByText('Сейчас условий для заражения милдью нет.'),
    ).toBeVisible()
  })

  it('без участков ничего не показывает, при ошибке погоды — объясняет', async () => {
    vineyards([])
    const { container } = renderWithQueryClient(<WeatherToday />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container).toBeEmptyDOMElement()
  })

  it('ошибка погоды', async () => {
    vineyards([{}])
    server.use(
      http.get('/api/v1/weather/current', () =>
        HttpResponse.json({ detail: 'Open-Meteo недоступен' }, { status: 502 }),
      ),
    )
    renderWithQueryClient(<WeatherToday />)

    expect(
      await screen.findByText('Погоду сейчас получить не удалось.'),
    ).toBeVisible()
  })
})
