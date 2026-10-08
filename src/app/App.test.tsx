import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSessionStore } from '@/store/session'
import { renderWithQueryClient } from '@/test/render'
import { App } from './App'

describe('App', () => {
  it('показывает главную страницу вошедшему пользователю', async () => {
    useSessionStore.getState().setAccessToken('token')
    renderWithQueryClient(<App />)

    expect(
      screen.getByRole('heading', { name: 'VitiGuard MD' }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/API 0\.1\.0/)).toBeInTheDocument()
  })
})
