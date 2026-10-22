import { refreshAccessToken, telegramLogin } from '@/api/auth'
import { setTokenProvider, setUnauthorizedHandler } from '@/api/client'
import { hasSignedIn, useSessionStore } from '@/store/session'

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
// обновление токена при 401 и восстанавливает сессию после перезагрузки
// страницы — если на этом устройстве был вход
export function initSession() {
  setTokenProvider(() => useSessionStore.getState().accessToken)
  setUnauthorizedHandler(refreshSession)
  if (!hasSignedIn()) {
    useSessionStore.getState().clear()
    return Promise.resolve(false)
  }
  return refreshSession()
}

// В мини-приложении Telegram вход без пароля (pr-090): если сессию не
// удалось восстановить, сервер проверяет подписанные данные запуска. Пока
// идёт проверка, вместо формы входа — экран загрузки. Не вышло (Telegram не
// привязан) — обычная форма входа
export async function signInWithTelegram(
  initData: string,
  restoring: Promise<boolean>,
) {
  if ((await restoring) || !initData) return false
  useSessionStore.setState({ status: 'unknown' })
  try {
    const { access_token } = await telegramLogin(initData)
    useSessionStore.getState().setAccessToken(access_token)
    return true
  } catch {
    useSessionStore.getState().clear()
    return false
  }
}
