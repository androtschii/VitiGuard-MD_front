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
    on = vi.fn()
    addSource = vi.fn()
    addLayer = vi.fn()
    removeLayer = vi.fn()
    removeSource = vi.fn()
    fitBounds = vi.fn()
    flyTo = vi.fn()
    doubleClickZoom = { disable: vi.fn(), enable: vi.fn() }
    getSource = vi.fn(() => ({ setData: vi.fn() }))
    off = vi.fn()
    canvas = { style: { cursor: '' } }
    getCanvas = vi.fn(() => this.canvas)

    constructor(options: unknown) {
      this.options = options
    }
  },
)

export const NavigationControl = vi.fn(class {})
export const FullscreenControl = vi.fn(class {})
export const ScaleControl = vi.fn(class {})
export const setWorkerUrl = vi.fn()

export const Marker = vi.fn(
  class {
    lngLat: unknown = null
    isOnMap = false
    setLngLat = vi.fn((lngLat: unknown) => {
      this.lngLat = lngLat
      return this
    })
    addTo = vi.fn(() => {
      this.isOnMap = true
      return this
    })
    remove = vi.fn(() => {
      this.isOnMap = false
      return this
    })
  },
)

// Попап: методы возвращают сам попап, как в MapLibre, чтобы работали цепочки
export const Popup = vi.fn(
  class {
    options: unknown
    lngLat: unknown = null
    text = ''
    content: HTMLElement | null = null
    isOpen = false
    listeners: Record<string, () => void> = {}

    constructor(options: unknown) {
      this.options = options
    }

    setLngLat = vi.fn((lngLat: unknown) => {
      this.lngLat = lngLat
      return this
    })
    setText = vi.fn((text: string) => {
      this.text = text
      return this
    })
    setDOMContent = vi.fn((content: HTMLElement) => {
      this.content = content
      return this
    })
    // Как MapLibre: содержимое попапа попадает в документ, пока попап открыт
    addTo = vi.fn(() => {
      this.isOpen = true
      if (this.content) document.body.append(this.content)
      return this
    })
    remove = vi.fn(() => {
      this.isOpen = false
      this.content?.remove()
      return this
    })
    on = vi.fn((event: string, listener: () => void) => {
      this.listeners[event] = listener
      return this
    })
  },
)
