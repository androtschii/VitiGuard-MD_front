import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { createQueryClient } from './queryClient'

type Retry = (failureCount: number, error: Error) => boolean

describe('createQueryClient', () => {
  const retry = createQueryClient().getDefaultOptions().queries?.retry as Retry

  it.each([
    {
      name: 'ошибку 404 не повторяет',
      attempts: 0,
      status: 404,
      expected: false,
    },
    { name: 'ошибку 503 повторяет', attempts: 0, status: 503, expected: true },
    { name: 'сбой сети повторяет', attempts: 1, status: null, expected: true },
    {
      name: 'после двух попыток сдаётся',
      attempts: 2,
      status: 503,
      expected: false,
    },
  ])('$name', ({ attempts, status, expected }) => {
    expect(retry(attempts, new ApiError('Ошибка', status))).toBe(expected)
  })
})
