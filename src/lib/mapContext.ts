import type { Map } from 'maplibre-gl'
import { createContext, useContext } from 'react'

// Загруженная карта для элементов, которые MapView показывает поверх неё:
// рисование, слои участков. Пока стиль не загружен, значение — null
export const MapContext = createContext<Map | null>(null)

export function useMap() {
  return useContext(MapContext)
}
