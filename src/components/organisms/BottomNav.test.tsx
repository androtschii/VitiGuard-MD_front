import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'
import { BottomNav } from './BottomNav'

const items = [
  { label: 'Главная', href: '/' },
  { label: 'Карта', href: '/map', current: true },
  { label: 'Районы', href: '/regions' },
  { label: 'Диагностика', href: '/diagnosis' },
  { label: 'Профиль', href: '/profile' },
  { label: 'Новый раздел', href: '/new' },
]

describe('BottomNav', () => {
  it('ведёт во все разделы и отмечает текущий', () => {
    renderWithRouter(<BottomNav items={items} />)

    const nav = screen.getByRole('navigation', { name: 'Основная навигация' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/map',
      '/regions',
      '/diagnosis',
      '/profile',
      '/new',
    ])
    expect(within(nav).getByRole('link', { name: 'Карта' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      within(nav).getByRole('link', { name: 'Главная' }),
    ).not.toHaveAttribute('aria-current')
    // Значок у раздела без своего значка — запасной, но он есть
    expect(links[5]?.querySelector('path')).toHaveAttribute('d')
  })
})
