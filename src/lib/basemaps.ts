import type {
  LayerSpecification,
  SourceSpecification,
  StyleSpecification,
} from 'maplibre-gl'

export const BASEMAPS = ['scheme', 'satellite', 'hybrid'] as const

export type Basemap = (typeof BASEMAPS)[number]

export function isBasemap(value: unknown): value is Basemap {
  return BASEMAPS.includes(value as Basemap)
}

const esri = (service: string) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/${service}/MapServer/tile/{z}/{y}/{x}`

const ESRI_ATTRIBUTION =
  'Esri, Maxar, Earthstar Geographics, GIS User Community'

// Растровые тайлы без ключа доступа: схема — OpenStreetMap (ODbL),
// снимки и подписи для гибрида — открытые сервисы Esri с обязательной атрибуцией
const sources: Record<string, SourceSpecification> = {
  osm: {
    type: 'raster',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    maxzoom: 19,
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  imagery: {
    type: 'raster',
    tiles: [esri('World_Imagery')],
    tileSize: 256,
    // Глубже снимки есть не везде: дальше карта увеличивает последний уровень
    maxzoom: 18,
    attribution: `© ${ESRI_ATTRIBUTION}`,
  },
  roads: {
    type: 'raster',
    tiles: [esri('Reference/World_Transportation')],
    tileSize: 256,
    maxzoom: 18,
  },
  places: {
    type: 'raster',
    tiles: [esri('Reference/World_Boundaries_and_Places')],
    tileSize: 256,
    maxzoom: 18,
  },
}

// Слои снизу вверх; подложка определяет, какие из них видны
const layers = [
  { id: 'scheme', source: 'osm' },
  { id: 'satellite', source: 'imagery' },
  { id: 'hybrid-roads', source: 'roads' },
  { id: 'hybrid-places', source: 'places' },
] as const

const visibleLayers: Record<Basemap, readonly string[]> = {
  scheme: ['scheme'],
  satellite: ['satellite'],
  hybrid: ['satellite', 'hybrid-roads', 'hybrid-places'],
}

export function basemapVisibility(basemap: Basemap) {
  return layers.map(
    (layer) =>
      [
        layer.id,
        visibleLayers[basemap].includes(layer.id) ? 'visible' : 'none',
      ] as const,
  )
}

// Все подложки лежат в одном стиле, а переключение меняет только видимость
// слоёв. setStyle заменил бы стиль целиком вместе со слоями участков
export function buildStyle(basemap: Basemap): StyleSpecification {
  const visibility = Object.fromEntries(basemapVisibility(basemap))
  return {
    version: 8,
    sources,
    layers: layers.map((layer): LayerSpecification => ({
      id: layer.id,
      type: 'raster',
      source: layer.source,
      layout: { visibility: visibility[layer.id] },
    })),
  }
}
