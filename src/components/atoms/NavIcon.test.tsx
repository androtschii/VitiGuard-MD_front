import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NavIcon } from './NavIcon'

describe('NavIcon', () => {
  it.each([
    '/',
    '/map',
    '/regions',
    '/diagnosis',
    '/history',
    '/profile',
    '/review',
    '/admin',
    '/other-fallback',
  ])('рендерит значок для %s', (href) => {
    const { container } = render(<NavIcon href={href} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
