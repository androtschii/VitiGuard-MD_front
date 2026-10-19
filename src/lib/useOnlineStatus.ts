import { useSyncExternalStore } from 'react'

// Есть ли сеть (pr-075). navigator.onLine говорит только о подключении к
// сети, а не о доступности сервера, но для подсказки «нет сети» этого хватает:
// ошибки самого сервера показывают запросы
function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
}
