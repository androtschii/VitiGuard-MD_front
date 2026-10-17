import type {
  ExpressionSpecification,
  GeoJSONSource,
  LayerSpecification,
} from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { useTodayRisks } from '@/api/risks'
import { useVineyards } from '@/api/vineyards'
import { LABEL_FONT } from '@/lib/boundaries'
import { boundsOf } from '@/lib/geo'
import { useMap } from '@/lib/mapContext'
import { filterVineyards } from '@/lib/vineyardFilter'
import { useMapStore } from '@/store/map'
import { riskByVineyard, toFeatureCollection } from '@/lib/vineyardFeatures'

const SOURCE = 'vineyards'

// Цвет участка — уровень риска на сегодня (pr-025): средний — янтарный,
// высокий — красный. Низкий риск и участки без оценки (вне сезона) —
// изумрудные, как растительность: красить их серым незачем
const RISK_FILL: ExpressionSpecification = [
  'match',
  ['get', 'risk'],
  'high',
  '#ef4444',
  'medium',
  '#f59e0b',
  '#10b981',
]
const RISK_LINE: ExpressionSpecification = [
  'match',
  ['get', 'risk'],
  'high',
  '#b91c1c',
  'medium',
  '#b45309',
  '#047857',
]

const layers: LayerSpecification[] = [
  {
    id: 'vineyards-fill',
    type: 'fill',
    source: SOURCE,
    paint: { 'fill-color': RISK_FILL, 'fill-opacity': 0.45 },
  },
  {
    id: 'vineyards-outline',
    type: 'line',
    source: SOURCE,
    paint: { 'line-color': RISK_LINE, 'line-width': 2 },
  },
  {
    id: 'vineyards-labels',
    type: 'symbol',
    source: SOURCE,
    // Мельче участок занимает несколько пикселей, и подпись закрыла бы соседей
    minzoom: 12,
    layout: {
      'text-field': ['get', 'name'],
      'text-font': [LABEL_FONT],
      'text-size': 12,
      'text-max-width': 10,
    },
    paint: {
      'text-color': '#064e3b',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.5,
    },
  },
]

// Участки пользователя поверх подложки и границ. Список приходит из кэша
// запросов, поэтому новый участок появляется сразу после сохранения
// Ширина панели инструментов (16rem) с отступами
const PANEL_GUTTER = 290

export function VineyardsLayer() {
  const map = useMap()
  const { data: vineyards } = useVineyards()
  const { data: risks } = useTodayRisks()
  const filter = useMapStore((state) => state.filter)
  const hasFittedRef = useRef(false)

  useEffect(() => {
    if (!map) return
    map.addSource(SOURCE, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })
    for (const layer of layers) map.addLayer(layer)

    return () => {
      // При уходе со страницы MapView может удалить карту раньше: тогда
      // убирать слои уже не из чего
      try {
        for (const layer of [...layers].reverse()) map.removeLayer(layer.id)
        map.removeSource(SOURCE)
      } catch {
        /* карта уже удалена вместе со слоями */
      }
    }
  }, [map])

  useEffect(() => {
    if (!map || !vineyards) return
    // setData возвращает промис обработки в фоновом потоке; ждать его не нужно
    void map
      .getSource<GeoJSONSource>(SOURCE)
      ?.setData(
        toFeatureCollection(
          filterVineyards(vineyards, filter),
          riskByVineyard(risks),
        ),
      )

    // Один раз приближаем карту к участкам: участок в пару гектаров на
    // масштабе всей страны занимает меньше пикселя
    if (hasFittedRef.current) return
    hasFittedRef.current = true
    const bounds = boundsOf(vineyards.map((vineyard) => vineyard.geometry))
    if (!bounds) return
    // Слева поверх карты лежит панель инструментов (MapToolbar): на широкой
    // карте участки показываются правее неё, а не под ней
    const width = map.getContainer().clientWidth
    const left = width >= 3 * PANEL_GUTTER ? PANEL_GUTTER : 48
    map.fitBounds(bounds, {
      padding: { top: 48, right: 48, bottom: 48, left },
      maxZoom: 15,
      duration: 0,
    })
  }, [map, vineyards, filter, risks])

  return null
}
