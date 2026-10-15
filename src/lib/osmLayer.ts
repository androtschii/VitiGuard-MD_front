import type { LngLatBounds } from 'maplibre-gl'

// Мельче этого масштаба полигоны виноградников занимают несколько пикселей,
// а окно карты шире градуса, которого сервер не принимает
export const OSM_MIN_ZOOM = 12

// Окно округляется до 0,01° (около километра) и расширяется наружу: мелкий
// сдвиг карты даёт тот же ключ запроса, и ответ берётся из кэша, а не с сервера
export function osmBbox(bounds: LngLatBounds) {
  const down = (value: number) => (Math.floor(value * 100) / 100).toFixed(2)
  const up = (value: number) => (Math.ceil(value * 100) / 100).toFixed(2)
  return [
    down(bounds.getWest()),
    down(bounds.getSouth()),
    up(bounds.getEast()),
    up(bounds.getNorth()),
  ].join(',')
}
