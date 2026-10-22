// Ошибки клиента в Sentry (pr-092). Включается адресом проекта в
// VITE_SENTRY_DSN; без него SDK даже не загружается — он приходит отдельным
// фрагментом сборки только туда, где мониторинг нужен
import type { ErrorEvent } from '@sentry/react'

type Reporter = {
  captureException: (
    error: unknown,
    hint?: { extra?: Record<string, unknown> },
  ) => unknown
}

let reporter: Promise<Reporter | null> | null = null

// Секреты в адресах: токен сброса пароля приходит в ссылке из письма
const SECRET_PARAMS = /([?&#](?:token|code|start|tgWebAppData)=)[^&#]*/gi

export function scrubUrl(url: string) {
  return url.replace(SECRET_PARAMS, '$1[скрыто]')
}

// Что уходит в Sentry: ошибка, стек, страница и браузер. Ни токенов, ни
// заголовков авторизации, ни email пользователя
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.headers
    delete event.request.cookies
    if (event.request.url) event.request.url = scrubUrl(event.request.url)
    if (typeof event.request.query_string === 'string')
      event.request.query_string = scrubUrl(`?${event.request.query_string}`)
  }
  delete event.user
  for (const crumb of event.breadcrumbs ?? []) {
    const data = crumb.data
    for (const key of ['url', 'from', 'to'])
      if (data && typeof data[key] === 'string') data[key] = scrubUrl(data[key])
  }
  return event
}

export function initMonitoring(
  dsn: string | undefined = import.meta.env.VITE_SENTRY_DSN,
) {
  if (!dsn) return Promise.resolve(null)
  reporter ??= import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      // Только ошибки: трассировка и запись сессий не нужны и стоят трафика
      tracesSampleRate: 0,
      // Ни данных пользователя, ни cookie, ни заголовков, ни тел запросов
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: false,
        httpBodies: [],
        urlQueryParams: false,
      },
      beforeSend: scrubEvent,
    })
    return Sentry
  })
  return reporter
}

// Ошибки, которые перехватило само приложение (граница ошибок, страница
// ошибки маршрута), — необработанные Sentry ловит и без этого
export function reportError(error: unknown, extra?: Record<string, unknown>) {
  void reporter?.then((sentry) =>
    sentry?.captureException(error, extra ? { extra } : undefined),
  )
}
