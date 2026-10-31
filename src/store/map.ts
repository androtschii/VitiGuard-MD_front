import { create } from 'zustand'
import { isBasemap, type Basemap } from '@/lib/basemaps'
import { NDVI_OPACITY } from '@/lib/ndviLayer'
import { MAX_STOPS, type RouteStop } from '@/lib/wineRoute'
import { NO_FILTER, type VineyardFilter } from '@/lib/vineyardFilter'

export const BASEMAP_STORAGE_KEY = 'vitiguard.basemap'

function readStoredBasemap(): Basemap {
  try {
    const stored = localStorage.getItem(BASEMAP_STORAGE_KEY)
    return isBasemap(stored) ? stored : 'scheme'
  } catch {
    return 'scheme'
  }
}

// Участок, попап которого открыт: его выбирают кликом по карте или в поиске
export type VineyardSelection = { id: string; lngLat: [number, number] }

type MapState = {
  basemap: Basemap
  setBasemap: (basemap: Basemap) => void
  // Пока контур рисуется или правится, клик по карте — точка контура,
  // а не выбор участка: попапы участков в это время не открываются
  isDrawing: boolean
  setDrawing: (isDrawing: boolean) => void
  selection: VineyardSelection | null
  select: (selection: VineyardSelection | null) => void
  filter: VineyardFilter
  setFilter: (filter: VineyardFilter) => void
  // Справочный слой виноградников OpenStreetMap и признак «масштаб слишком мелкий»
  showOsm: boolean
  setShowOsm: (showOsm: boolean) => void
  osmTooFar: boolean
  setOsmTooFar: (osmTooFar: boolean) => void
  // Винодельни и винные магазины
  showWineries: boolean
  setShowWineries: (showWineries: boolean) => void
  // Винный маршрут на день
  wineRoute: RouteStop[]
  addRouteStop: (stop: RouteStop) => void
  removeRouteStop: (name: string) => void
  clearRoute: () => void
  // Картограммы NDVI поверх участков пользователя
  showNdvi: boolean
  setShowNdvi: (showNdvi: boolean) => void
  // Непрозрачность картограмм 0..1: сквозь снимок видна подложка
  ndviOpacity: number
  setNdviOpacity: (ndviOpacity: number) => void
  // День на шкале снимков YYYY-MM-DD; null — последний снимок, в том числе
  // новый, пришедший после выбора
  ndviDay: string | null
  setNdviDay: (ndviDay: string | null) => void
}

// Выбранная подложка сохраняется: агроном, работающий по снимкам,
// не переключает её заново при каждом открытии карты
export const useMapStore = create<MapState>()((set) => ({
  basemap: readStoredBasemap(),
  setBasemap: (basemap) => {
    try {
      localStorage.setItem(BASEMAP_STORAGE_KEY, basemap)
    } catch {
      // Подложка сменится и без сохранения, просто не переживёт перезагрузку
    }
    set({ basemap })
  },
  showWineries: false,
  setShowWineries: (showWineries) => set({ showWineries }),
  wineRoute: [],
  addRouteStop: (stop) =>
    set(({ wineRoute }) =>
      wineRoute.length >= MAX_STOPS ||
      wineRoute.some((item) => item.name === stop.name)
        ? {}
        : { wineRoute: [...wineRoute, stop] },
    ),
  removeRouteStop: (name) =>
    set(({ wineRoute }) => ({
      wineRoute: wineRoute.filter((item) => item.name !== name),
    })),
  clearRoute: () => set({ wineRoute: [] }),
  isDrawing: false,
  setDrawing: (isDrawing) => set({ isDrawing }),
  selection: null,
  select: (selection) => set({ selection }),
  filter: NO_FILTER,
  setFilter: (filter) => set({ filter }),
  showOsm: false,
  setShowOsm: (showOsm) => set({ showOsm }),
  osmTooFar: false,
  setOsmTooFar: (osmTooFar) => set({ osmTooFar }),
  showNdvi: false,
  setShowNdvi: (showNdvi) => set({ showNdvi }),
  ndviOpacity: NDVI_OPACITY,
  setNdviOpacity: (ndviOpacity) => set({ ndviOpacity }),
  ndviDay: null,
  setNdviDay: (ndviDay) => set({ ndviDay }),
}))
