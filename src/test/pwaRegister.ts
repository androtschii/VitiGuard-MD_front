import { useState } from 'react'
import { vi } from 'vitest'

// Замена виртуального модуля vite-plugin-pwa в тестах: Service Worker в jsdom
// нет. Начальное состояние задаёт тест через pwaState
export const pwaState = {
  needRefresh: false,
  offlineReady: false,
  updateServiceWorker: vi.fn<(reload?: boolean) => Promise<void>>(),
}

export function useRegisterSW() {
  const needRefresh = useState(pwaState.needRefresh)
  const offlineReady = useState(pwaState.offlineReady)
  return {
    needRefresh,
    offlineReady,
    updateServiceWorker: pwaState.updateServiceWorker,
  }
}
