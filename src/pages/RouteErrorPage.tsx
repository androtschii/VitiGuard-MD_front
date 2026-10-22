import { useEffect } from 'react'
import { useRouteError } from 'react-router'
import { reportError } from '@/lib/monitoring'
import { ErrorPage } from '@/pages/ErrorPage'

export function RouteErrorPage() {
  const error = useRouteError()

  // Ошибку страницы перехватил роутер: сама до Sentry она не дойдёт (pr-092)
  useEffect(() => {
    reportError(error)
  }, [error])

  return <ErrorPage onRetry={() => window.location.reload()} />
}
