import { ErrorPage } from '@/pages/ErrorPage'

export function RouteErrorPage() {
  return <ErrorPage onRetry={() => window.location.reload()} />
}
