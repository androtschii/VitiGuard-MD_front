import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GrapeFill } from './GrapeFill'

describe('GrapeFill', () => {
  it('скрыт от экранных дикторов и принимает классы', () => {
    const { container } = render(<GrapeFill className="size-24" />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveClass('size-24')
  })

  it('заполняет соком все ягоды эмблемы', () => {
    const { container } = render(<GrapeFill />)

    expect(container.querySelectorAll('clipPath circle')).toHaveLength(10)
    expect(container.querySelector('.grape-fill-wave')).not.toBeNull()
    expect(container.querySelectorAll('.grape-fill-bubble')).toHaveLength(5)
  })
})
