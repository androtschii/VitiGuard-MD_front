import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteError } from 'react-router'
import { reportError } from '@/lib/monitoring'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { ErrorPage } from '@/pages/ErrorPage'

export function RouteErrorPage() {
  const error = useRouteError()
  const { t } = useTranslation()

  useDocumentTitle(t('errorPage.title'))

  // Ошибку страницы перехватил роутер: сама до Sentry она не дойдёт (pr-092)
  useEffect(() => {
    reportError(error)
  }, [error])

  return <ErrorPage onRetry={() => window.location.reload()} />
}
