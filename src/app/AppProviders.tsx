import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { createQueryClient } from '@/api/queryClient'
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary'
import { ErrorPage } from '@/pages/ErrorPage'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient)

  // Последний рубеж: ловит ошибки вне маршрутов, например в самих провайдерах
  return (
    <ErrorBoundary
      fallback={() => <ErrorPage onRetry={() => window.location.reload()} />}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ErrorBoundary>
  )
}
