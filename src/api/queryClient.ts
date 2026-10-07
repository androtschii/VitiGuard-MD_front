import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'

// Ответы 4xx при повторе не изменятся, поэтому повторяем только сбои сети и ошибки 5xx
function shouldRetry(failureCount: number, error: Error) {
  const isClientError =
    error instanceof ApiError && error.status !== null && error.status < 500
  return failureCount < 2 && !isClientError
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
      },
    },
  })
}
