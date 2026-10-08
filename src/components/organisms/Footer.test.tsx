import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './Footer'

describe('Footer', () => {
  it('подписывает проект и текущий год', () => {
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      `© ${new Date().getFullYear()} VitiGuard MD`,
    )
  })
})
