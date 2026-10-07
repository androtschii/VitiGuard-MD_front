import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo } from './Logo'

describe('Logo', () => {
  it('скрыт от экранных дикторов и принимает классы', () => {
    const { container } = render(<Logo className="size-16" />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveClass('size-16')
  })
})
