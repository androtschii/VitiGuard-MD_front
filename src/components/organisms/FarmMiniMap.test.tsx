import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Polygon } from 'geojson'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { fetchBoundaries } from '@/api/geo'
import type { VegetationObservation } from '@/api/vegetation'
import { boundsOf, projection, svgPath } from '@/lib/miniMap'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { FarmMiniMap } from './FarmMiniMap'
import { NdviSeason } from './NdviSeason'

const country: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [27, 46],
      [30, 46],
      [30, 48],
      [27, 48],
      [27, 46],
    ],
  ],
}

function plot(id: string, name: string, lon: number, lat: number) {
  return {
    id,
    name,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [lon, lat],
            [lon + 0.01, lat],
            [lon + 0.01, lat + 0.01],
            [lon, lat + 0.01],
            [lon, lat],
          ],
        ],
      ],
    },
    area_ha: 4,
    variety_id: null,
    planting_year: null,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  }
}

function setup(plots: ReturnType<typeof plot>[]) {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: plots,
        total: plots.length,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
    http.get('/geo/moldova-districts.geojson', () =>
      HttpResponse.json({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { kind: 'country' },
            geometry: country,
          },
          {
            type: 'Feature',
            properties: { kind: 'district' },
            geometry: country,
          },
          {
            type: 'Feature',
            properties: { kind: 'label' },
            geometry: { type: 'Point', coordinates: [28, 47] },
          },
        ],
      }),
    ),
  )
}

function observation(day: string, ndvi: number): VegetationObservation {
  const value = { mean: ndvi, min: ndvi, max: ndvi, std: 0 }
  return {
    id: day,
    acquired_at: `${day}T09:00:00Z`,
    platform: 'sentinel-2a',
    scene_cloud_cover: 0,
    parcel_cloud_cover: 0,
    ndvi: value,
    ndre: value,
    ndvi_map: null,
  }
}

describe('схема для главной', () => {
  it('сохраняет пропорции и переводит точки и контуры в SVG', () => {
    const view = projection(boundsOf([country]), 300)
    expect(view.width).toBe(300)
    // На широте 47° градус долготы короче градуса широты
    expect(view.height).toBeGreaterThan(200)
    expect(view.project([27, 48])).toEqual([0, 0])
    expect(svgPath(country, view)).toMatch(
      /^M0\.0 293\.3L300\.0 293\.3L300\.0 0\.0/,
    )
    expect(svgPath({ type: 'Point', coordinates: [28, 47] }, view)).toBe('')
    const multi = { type: 'MultiPolygon', coordinates: [country.coordinates] }
    expect(svgPath(multi as never, view)).toContain('Z')
    // Точка без размера не делит на ноль
    const dot: Polygon = { type: 'Polygon', coordinates: [[[28, 47]]] }
    expect(projection(boundsOf([dot]), 100).width).toBe(100)
  })

  it('ошибка загрузки границ', async () => {
    server.use(
      http.get('/geo/moldova-districts.geojson', () =>
        HttpResponse.json({}, { status: 404 }),
      ),
    )
    await expect(fetchBoundaries()).rejects.toThrow('HTTP 404')
  })

  it('без страны в файле контура нет', async () => {
    server.use(
      http.get('/geo/moldova-districts.geojson', () =>
        HttpResponse.json({ type: 'FeatureCollection', features: [] }),
      ),
    )
    expect(await fetchBoundaries()).toEqual({ country: null, districts: [] })
  })
})

describe('FarmMiniMap', () => {
  it('отмечает участки на схеме и ведёт на карту', async () => {
    setup([
      plot('a', 'Криково', 28.86, 47.14),
      plot('b', 'Пуркарь', 29.86, 46.52),
    ])
    renderWithQueryClient(
      <MemoryRouter>
        <FarmMiniMap />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('img', {
        name: 'Схема Молдовы, отмечено участков: 2',
      }),
    ).toBeVisible()
    expect(screen.getAllByTestId('mini-map-plot')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Открыть карту' })).toHaveAttribute(
      'href',
      '/map',
    )
  })

  it('без участков ничего не рисует, участок без контура пропускает', async () => {
    setup([])
    const { container } = renderWithQueryClient(
      <MemoryRouter>
        <FarmMiniMap />
      </MemoryRouter>,
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container).toBeEmptyDOMElement()
  })

  it('участок с пустым контуром в списке есть, на схеме — нет', async () => {
    const broken = {
      ...plot('c', 'Без контура', 28, 47),
      geometry: { type: 'MultiPolygon', coordinates: [] },
    }
    setup([plot('a', 'Криково', 28.86, 47.14), broken])
    renderWithQueryClient(
      <MemoryRouter>
        <FarmMiniMap />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Без контура')).toBeVisible()
    expect(screen.getAllByTestId('mini-map-plot')).toHaveLength(1)
  })
})

describe('NdviSeason', () => {
  it('рисует NDVI первого участка и переключается на другой', async () => {
    setup([
      plot('a', 'Криково', 28.86, 47.14),
      plot('b', 'Пуркарь', 29.86, 46.52),
    ])
    const asked: string[] = []
    server.use(
      http.get('/api/v1/vineyards/:id/vegetation', ({ params }) => {
        asked.push(String(params.id))
        return HttpResponse.json(
          params.id === 'a'
            ? [observation('2026-06-01', 0.5), observation('2026-07-01', 0.7)]
            : [],
        )
      }),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<NdviSeason />)

    expect(await screen.findByText(/NDVI — биомасса/)).toBeVisible()
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Участок для графика' }),
      'b',
    )

    expect(
      await screen.findByText(/Снимков Sentinel-2 по участку пока нет/),
    ).toBeVisible()
    expect(asked).toEqual(['a', 'b'])
  })

  it('с одним участком выбора нет; ошибка загрузки видна', async () => {
    setup([plot('a', 'Криково', 28.86, 47.14)])
    server.use(
      http.get('/api/v1/vineyards/:id/vegetation', () =>
        HttpResponse.json({ detail: 'Нет связи с Sentinel' }, { status: 502 }),
      ),
    )
    renderWithQueryClient(<NdviSeason />)

    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('без участков ничего не показывает', async () => {
    setup([])
    const { container } = renderWithQueryClient(<NdviSeason />)
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })
})
