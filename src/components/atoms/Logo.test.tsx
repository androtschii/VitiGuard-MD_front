import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo } from './Logo'
import { Wordmark } from './Wordmark'

describe('Logo', () => {
  it('эмблема скрыта от экранных дикторов и принимает классы', () => {
    const { container } = render(<Logo className="size-16" />)
    const img = container.querySelector('img')

    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden', 'true')
    expect(img).toHaveClass('size-16')
  })
})

describe('Wordmark', () => {
  it('пишет название текстом', () => {
    render(<Wordmark />)

    expect(screen.getByText('Viti')).toHaveClass('font-bold')
    expect(screen.getByText('Guard')).toBeInTheDocument()
    expect(screen.queryByText(/Vineyard health/)).not.toBeInTheDocument()
  })

  it('в крупном варианте добавляет подпись', () => {
    render(<Wordmark size="lg" withTagline />)

    expect(
      screen.getByText('MD | Vineyard health monitoring system'),
    ).toBeInTheDocument()
  })
})
