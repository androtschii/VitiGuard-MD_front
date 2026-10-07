import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  it('показывает название приложения', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'VitiGuard MD' }),
    ).toBeInTheDocument()
  })
})
