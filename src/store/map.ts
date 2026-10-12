import { create } from 'zustand'
import { isBasemap, type Basemap } from '@/lib/basemaps'

export const BASEMAP_STORAGE_KEY = 'vitiguard.basemap'

function readStoredBasemap(): Basemap {
  try {
    const stored = localStorage.getItem(BASEMAP_STORAGE_KEY)
    return isBasemap(stored) ? stored : 'scheme'
  } catch {
    return 'scheme'
  }
}

type MapState = {
  basemap: Basemap
  setBasemap: (basemap: Basemap) => void
  // Пока контур рисуется или правится, клик по карте — точка контура,
  // а не выбор участка: попапы участков в это время не открываются
  isDrawing: boolean
  setDrawing: (isDrawing: boolean) => void
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
  isDrawing: false,
  setDrawing: (isDrawing) => set({ isDrawing }),
}))
