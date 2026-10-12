import { act } from '@testing-library/react'
import { vi } from 'vitest'

type Listener = (...args: unknown[]) => void

// Terra Draw рисует через WebGL-карту, которой в jsdom нет. Заглушка запоминает
// режимы и подписки, а «нарисованные» фигуры тест кладёт в features сам
export class FakeDraw {
  listeners: Record<string, Listener> = {}
  features: Record<string, unknown> = {}
  start = vi.fn()
  stop = vi.fn()
  clear = vi.fn()
  selectFeature = vi.fn()
  setMode = vi.fn()
  on = vi.fn((event: string, listener: Listener) => {
    this.listeners[event] = listener
  })
  getSnapshotFeature = vi.fn((id: string) => this.features[id])

  emit(event: string, ...args: unknown[]) {
    act(() => this.listeners[event]?.(...args))
  }
}

export const TerraDraw = vi.fn(function () {
  return new FakeDraw()
})
export const TerraDrawPolygonMode = vi.fn(class {})
export const TerraDrawSelectMode = vi.fn(class {})
export const ValidateNotSelfIntersecting = vi.fn(() => ({ valid: true }))
export const TerraDrawMapLibreGLAdapter = vi.fn(class {})

// Последний созданный экземпляр — тот, что рисует на карте в текущем тесте
export function lastDraw() {
  return TerraDraw.mock.results.at(-1)?.value as FakeDraw
}

// Тот же контур 0,01° × 0,01° у Кишинёва, что и в тестах площади: 84,32 га
export const parcel = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon' as const,
    coordinates: [
      [
        [28.8, 47.0],
        [28.81, 47.0],
        [28.81, 47.01],
        [28.8, 47.01],
        [28.8, 47.0],
      ],
    ],
  },
}
