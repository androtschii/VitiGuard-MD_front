import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { ApiStatus } from './ApiStatus'

describe('ApiStatus', () => {
  it('показывает версию и окружение API', async () => {
    renderWithQueryClient(<ApiStatus />)

    expect(
      await screen.findByText('API 0.1.0, окружение test'),
    ).toBeInTheDocument()
  })

  it('сообщает, что API недоступен', async () => {
    server.use(http.get('/api/v1/info', () => HttpResponse.error()))

    renderWithQueryClient(<ApiStatus />)

    expect(await screen.findByText('API недоступен')).toBeInTheDocument()
  })
})
