import { refreshAccessToken } from '@/api/auth'
import { setTokenProvider, setUnauthorizedHandler } from '@/api/client'
import { useSessionStore } from '@/store/session'

let refreshing: Promise<boolean> | null = null

// Обновляет access-токен по refresh-cookie. Параллельные вызовы делят один запрос:
// при ротации refresh-токенов второй одновременный запрос получил бы отказ
// и разлогинил пользователя
export function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing

  const request = refreshAccessToken()
    .then(({ access_token }) => {
      useSessionStore.getState().setAccessToken(access_token)
      return true
    })
    .catch(() => {
      useSessionStore.getState().clear()
      return false
    })
    .finally(() => {
      refreshing = null
    })
  refreshing = request
  return request
}

// Вызывается один раз при запуске: подключает токен к запросам, включает
// обновление токена при 401 и восстанавливает сессию после перезагрузки страницы
export function initSession() {
  setTokenProvider(() => useSessionStore.getState().accessToken)
  setUnauthorizedHandler(refreshSession)
  return refreshSession()
}
