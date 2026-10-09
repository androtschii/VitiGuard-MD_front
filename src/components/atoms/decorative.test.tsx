import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './Skeleton'
import { Spinner } from './Spinner'

describe.each([
  ['Skeleton', Skeleton],
  ['Spinner', Spinner],
])('%s', (_, Component) => {
  it('скрыт от экранных дикторов', () => {
    const { container } = render(<Component />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('принимает дополнительные классы', () => {
    const { container } = render(<Component className="size-8" />)

    expect(container.firstElementChild).toHaveClass('size-8')
  })
})
