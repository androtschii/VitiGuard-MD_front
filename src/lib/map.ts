import type { LngLatBoundsLike } from 'maplibre-gl'

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

export function supportsWebGL() {
  const canvas = document.createElement('canvas')
  return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
}
