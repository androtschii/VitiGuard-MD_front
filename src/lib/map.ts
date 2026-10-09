import type { LngLatBoundsLike, StyleSpecification } from 'maplibre-gl'

// Границы Молдовы: при открытии карта вписывает страну целиком в любой экран
export const MOLDOVA_BOUNDS: LngLatBoundsLike = [
  [26.6, 45.4],
  [30.2, 48.5],
]

// Страна с запасом по краям: карту нельзя увести туда, где участков быть не может
export const MOLDOVA_MAX_BOUNDS: LngLatBoundsLike = [
  [25.5, 44.9],
  [31.5, 48.9],
]

export const MIN_ZOOM = 6

export const MAX_ZOOM = 19

// Растровая схема OpenStreetMap: без ключа доступа и с открытой лицензией (ODbL)
export const baseStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: MAX_ZOOM,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

export function supportsWebGL() {
  const canvas = document.createElement('canvas')
  return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
}
