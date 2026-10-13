import type { LayerSpecification, SourceSpecification } from 'maplibre-gl'

// Шрифт подписей лежит в public/fonts: только латиница и румынские буквы,
// без зависимости от чужого сервера шрифтов
export const LABEL_FONT = 'Open Sans Semibold'

// Адреса абсолютные: MapLibre загружает данные в фоновом потоке, запущенном
// из blob-адреса, и относительный путь там не указывает на наш сайт
function publicUrl(path: string, origin: string) {
  return `${origin}${import.meta.env.BASE_URL}${path}`
}

export function glyphsUrl(origin = window.location.origin) {
  return publicUrl('fonts/{fontstack}/{range}.pbf', origin)
}

// Границы районов (ADM1, geoBoundaries) и страны — один файл в public/geo.
// Граница страны получена объединением районов, поэтому линии совпадают
export function boundariesSource(
  origin = window.location.origin,
): SourceSpecification {
  return {
    type: 'geojson',
    data: publicUrl('geo/moldova-districts.geojson', origin),
    attribution:
      '<a href="https://www.geoboundaries.org">geoBoundaries</a> (UNHCR, OCHA, CC BY 3.0 IGO)',
  }
}

// Фиолетовый — цвет винограда из логотипа: заметен и на схеме, и на снимках
const BORDER_COLOR = '#622ac3'

export const boundaryLayers: LayerSpecification[] = [
  {
    id: 'district-borders',
    type: 'line',
    source: 'boundaries',
    filter: ['==', ['get', 'kind'], 'district'],
    paint: {
      'line-color': BORDER_COLOR,
      'line-opacity': 0.85,
      'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 11, 2],
      'line-dasharray': [3, 2],
    },
  },
  {
    id: 'country-border',
    type: 'line',
    source: 'boundaries',
    filter: ['==', ['get', 'kind'], 'country'],
    paint: {
      'line-color': BORDER_COLOR,
      'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.5, 11, 3.5],
    },
  },
  {
    id: 'district-labels',
    type: 'symbol',
    source: 'boundaries',
    // Отдельные точки подписей: у района из нескольких частей подпись одна
    filter: ['==', ['get', 'kind'], 'label'],
    // Мельче масштаба всей страны 37 подписей сливаются в кашу
    minzoom: 7,
    layout: {
      'text-field': ['get', 'name'],
      'text-font': [LABEL_FONT],
      'text-size': 12,
      'text-max-width': 8,
    },
    paint: {
      'text-color': '#351578',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.5,
    },
  },
]
