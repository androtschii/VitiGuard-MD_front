import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import i18n from '@/i18n'
import { useMapStore } from '@/store/map'
import { useSessionStore } from '@/store/session'
import { useThemeStore } from '@/theme'
import { server } from './server'

// В jsdom нет showModal() и close() у <dialog>, а в браузерах они есть давно
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.open = true
    },
    close(this: HTMLDialogElement) {
      this.open = false
      this.dispatchEvent(new Event('close'))
    },
  })
}

// В jsdom нет WebGL: MapLibre заменён заглушкой, а холст не даёт контекст.
// Тесты карты включают «WebGL» сами через spyOn на getContext
vi.mock('maplibre-gl', () => import('./maplibre'))
HTMLCanvasElement.prototype.getContext = () => null

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// По умолчанию в тестах пользователь не вошёл; тесты сессии задают своё состояние
beforeEach(async () => {
  useSessionStore.getState().clear()
  // Тексты в тестах проверяются по-русски, независимо от языка окружения
  localStorage.clear()
  await i18n.changeLanguage('ru')
  useThemeStore.setState({ theme: 'system' })
  useMapStore.setState({ basemap: 'scheme' })
  document.documentElement.classList.remove('dark')
})

afterEach(() => {
  // Без глобального afterEach Testing Library сама не очищает DOM между тестами
  cleanup()
  vi.restoreAllMocks()
  server.resetHandlers()
})

afterAll(() => server.close())
