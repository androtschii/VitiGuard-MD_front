import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'
import { Sidebar } from './Sidebar'

const items = [
  { label: 'Участки', href: '/vineyards', current: true },
  { label: 'Диагностика', href: '/diagnosis' },
]

describe('Sidebar', () => {
  it('выводит навигацию и отмечает текущую страницу', () => {
    renderWithRouter(<Sidebar items={items} />)

    expect(
      screen.getByRole('navigation', { name: 'Основная навигация' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Участки' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      screen.getByRole('link', { name: 'Диагностика' }),
    ).not.toHaveAttribute('aria-current')
  })
})
