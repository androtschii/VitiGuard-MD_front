import { vi } from 'vitest'

// В jsdom нет WebGL, поэтому в тестах MapLibre подменяется заглушкой,
// которая запоминает, с какими настройками создана карта
export const Map = vi.fn(
  class {
    options: unknown
    addControl = vi.fn()
    remove = vi.fn()
    setLayoutProperty = vi.fn()
    isStyleLoaded = vi.fn(() => true)
    once = vi.fn()

    constructor(options: unknown) {
      this.options = options
    }
  },
)

export const NavigationControl = vi.fn(class {})
export const FullscreenControl = vi.fn(class {})
export const ScaleControl = vi.fn(class {})
export const setWorkerUrl = vi.fn()
