import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { useSessionStore } from '@/store/session'
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

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// По умолчанию в тестах пользователь не вошёл; тесты сессии задают своё состояние
beforeEach(() => {
  useSessionStore.getState().clear()
})

afterEach(() => {
  // Без глобального afterEach Testing Library сама не очищает DOM между тестами
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
