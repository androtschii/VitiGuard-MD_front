import { describe, expect, it } from 'vitest'
import { boundariesSource, boundaryLayers, glyphsUrl } from './boundaries'

type Feature = {
  properties: { kind: string; name: string; iso: string }
  geometry: { type: string }
}

// Файлы из public читаются через Vite, как в приложении, без API Node
const files = import.meta.glob<string>('/public/geo/*.geojson', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const geojson = JSON.parse(
  files['/public/geo/moldova-districts.geojson'] ?? '{}',
) as { features: Feature[] }

const fonts = Object.keys(
  import.meta.glob('/public/fonts/**/*.pbf', { query: '?url' }),
)

describe('границы', () => {
  it('файл содержит контур страны и 37 административных единиц', () => {
    const kinds = geojson.features.map((feature) => feature.properties.kind)

    expect(kinds.filter((kind) => kind === 'country')).toHaveLength(1)
    expect(kinds.filter((kind) => kind === 'district')).toHaveLength(37)
    // По одной точке подписи на район
    expect(kinds.filter((kind) => kind === 'label')).toHaveLength(37)
  })

  it('названия районов — официальные, с румынской диакритикой', () => {
    const names = geojson.features.map((feature) => feature.properties.name)

    expect(names).toEqual(
      expect.arrayContaining(['Chișinău', 'Bălți', 'Ștefan Vodă', 'Rîșcani']),
    )
  })

  it('границы — полигоны, подписи — точки', () => {
    const types = (kind: string) =>
      new Set(
        geojson.features
          .filter((f) => f.properties.kind === kind)
          .map((f) => f.geometry.type),
      )

    expect([...types('district')].sort()).toEqual(['MultiPolygon', 'Polygon'])
    expect([...types('label')]).toEqual(['Point'])
  })

  it('подписи используют шрифт, который лежит в public/fonts', () => {
    const labels = boundaryLayers.find(
      (layer) => layer.id === 'district-labels',
    )

    expect(labels?.layout).toMatchObject({
      'text-font': ['Open Sans Semibold'],
    })
    // ă и î — во втором диапазоне глифов, ș и ț — в третьем, кириллица
    // названий участков — в 1024–1279
    expect(fonts).toEqual(
      expect.arrayContaining([
        '/public/fonts/Open Sans Semibold/0-255.pbf',
        '/public/fonts/Open Sans Semibold/256-511.pbf',
        '/public/fonts/Open Sans Semibold/512-767.pbf',
        '/public/fonts/Open Sans Semibold/1024-1279.pbf',
      ]),
    )
  })

  it('адрес данных абсолютный: фоновый поток MapLibre не знает адреса сайта', () => {
    expect(boundariesSource('https://vitiguard.md')).toMatchObject({
      data: 'https://vitiguard.md/geo/moldova-districts.geojson',
    })
  })

  it('адрес шрифтов абсолютный: MapLibre не принимает относительный', () => {
    expect(glyphsUrl('https://vitiguard.md')).toBe(
      'https://vitiguard.md/fonts/{fontstack}/{range}.pbf',
    )
  })
})
