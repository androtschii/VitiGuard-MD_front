import axios, { isAxiosError } from 'axios'

export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

declare module 'axios' {
  interface AxiosRequestConfig {
    // Запрос уже повторялся после обновления токена: второй раз не повторяем,
    // иначе постоянный 401 привёл бы к бесконечному циклу
    _retried?: boolean
  }
}

type TokenProvider = () => string | null

// Возвращает true, если токен удалось обновить и запрос можно повторить
type UnauthorizedHandler = () => Promise<boolean>

let getAccessToken: TokenProvider = () => null
let onUnauthorized: UnauthorizedHandler | null = null

// Источник токена подключает модуль сессии (src/app/session.ts)
export function setTokenProvider(provider: TokenProvider) {
  getAccessToken = provider
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 15_000,
  // Refresh-токен лежит в HttpOnly-cookie: браузер должен отправлять её и при
  // запросах к API на другом адресе (в разработке с VITE_API_URL)
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const config = getRetryableConfig(error)
    if (config && (await onUnauthorized?.())) {
      // Токен обновлён: тот же запрос повторяется уже с новым токеном
      return api.request({ ...config, _retried: true })
    }
    throw toApiError(error)
  },
)

// Конфиг запроса, который стоит повторить после обновления токена, либо null
function getRetryableConfig(error: unknown) {
  if (!isAxiosError(error) || error.response?.status !== 401) return null
  const { config } = error
  // Ошибки самих запросов авторизации (неверный пароль, устаревший refresh)
  // не лечатся обновлением токена
  if (!config || config._retried || !onUnauthorized) return null
  return config.url?.startsWith('/auth/') ? null : config
}

function toApiError(error: unknown): ApiError {
  if (!isAxiosError<{ detail?: unknown }>(error) || !error.response) {
    return new ApiError('Сервер недоступен', null)
  }
  const { status, data } = error.response
  // FastAPI возвращает текст ошибки в поле detail
  const message =
    typeof data?.detail === 'string'
      ? data.detail
      : `Ошибка сервера (${status})`
  return new ApiError(message, status)
}
