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

  it.each([
    ['к текущему разделу', 0, 3, '-4.00deg'],
    ['без текущего раздела', -1, 3, '0deg'],
    ['с единственным разделом', 0, 1, '0deg'],
  ])('наклон: %s', (_, current, count, tilt) => {
    const sections = items.slice(0, count).map(({ label, href }, index) => ({
      label,
      href,
      current: index === current,
    }))
    renderWithRouter(<BottomNav items={sections} />)

    expect(screen.getByRole('list').style.getPropertyValue('--nav-tilt')).toBe(
      tilt,
    )
  })

  it.each([
    ['/', '.nav-icon-roof'],
    ['/map', '.nav-icon-map'],
    ['/regions', '.nav-icon-bar'],
    ['/diagnosis', '.nav-icon-leaf'],
    ['/history', '.nav-icon-hands'],
    ['/profile', '.nav-icon-head'],
    ['/admin', '.nav-icon-check'],
  ])('у значка %s есть подвижная часть', (href, part) => {
    renderWithRouter(<BottomNav items={[{ label: 'Раздел', href }]} />)

    expect(screen.getByRole('link').querySelector(part)).not.toBeNull()
  })
})
