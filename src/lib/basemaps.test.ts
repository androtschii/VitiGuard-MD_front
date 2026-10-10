import { describe, expect, it } from 'vitest'
import { basemapVisibility, buildStyle, isBasemap } from './basemaps'

const visible = (basemap: Parameters<typeof basemapVisibility>[0]) =>
  basemapVisibility(basemap)
    .filter(([, visibility]) => visibility === 'visible')
    .map(([layerId]) => layerId)

describe('подложки', () => {
  it.each([
    ['scheme', ['scheme']],
    ['satellite', ['satellite']],
    ['hybrid', ['satellite', 'hybrid-roads', 'hybrid-places']],
  ] as const)('%s показывает только свои слои', (basemap, layers) => {
    expect(visible(basemap)).toEqual(layers)
  })

  it('стиль содержит все подложки, видимость — по выбранной', () => {
    const style = buildStyle('satellite')

    expect(style.layers.map((layer) => layer.id)).toEqual([
      'scheme',
      'satellite',
      'hybrid-roads',
      'hybrid-places',
    ])
    expect(style.layers[0]?.layout).toEqual({ visibility: 'none' })
    expect(style.layers[1]?.layout).toEqual({ visibility: 'visible' })
  })

  it('у источников, которые видны сами по себе, есть атрибуция', () => {
    const { sources } = buildStyle('scheme')

    expect(sources.osm).toHaveProperty('attribution')
    expect(sources.imagery).toHaveProperty('attribution')
  })

  it('распознаёт только известные подложки', () => {
    expect(isBasemap('hybrid')).toBe(true)
    expect(isBasemap('terrain')).toBe(false)
    expect(isBasemap(null)).toBe(false)
  })
})
