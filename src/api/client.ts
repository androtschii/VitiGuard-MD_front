import axios, { isAxiosError } from 'axios'

export class ApiError extends Error {
  readonly status: number | null

  constructor(message: string, status: number | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type TokenProvider = () => string | null

let getAccessToken: TokenProvider = () => null

// Источник токена подключит модуль авторизации (pr-014)
export function setTokenProvider(provider: TokenProvider) {
  getAccessToken = provider
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 15_000,
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
  (error: unknown) => Promise.reject(toApiError(error)),
)

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
