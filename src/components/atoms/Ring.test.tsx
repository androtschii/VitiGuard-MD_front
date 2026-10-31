import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Ring } from './Ring'

describe('Ring', () => {
  it('раскладывает доли одну за другой', () => {
    const { container } = render(
      <Ring
        segments={[
          { percent: 25, className: 'stroke-red-600' },
          { percent: 50, className: 'stroke-amber-500' },
        ]}
      >
        <span>2</span>
      </Ring>,
    )

    const [first, second] = container.querySelectorAll('.ring-segment')
    expect(first).toHaveAttribute('stroke-dasharray', '25 75')
    expect(second).toHaveAttribute('stroke-dasharray', '50 50')
    expect(second).toHaveAttribute('stroke-dashoffset', '-25')
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('без подписи в центре не создаёт лишний слой', () => {
    const { container } = render(<Ring segments={[]} />)

    expect(container.querySelector('.absolute')).toBeNull()
  })
})
