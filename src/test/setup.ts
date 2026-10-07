import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  // Без глобального afterEach Testing Library сама не очищает DOM между тестами
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
