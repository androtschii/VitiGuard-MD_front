import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('показывает главную страницу', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'VitiGuard MD' }),
    ).toBeInTheDocument()
  })
})
