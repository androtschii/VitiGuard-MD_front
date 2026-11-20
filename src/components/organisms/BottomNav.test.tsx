import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('до 5 пунктов: показывает все разделы без кнопки «Ещё»', () => {
    const fiveItems = items.slice(0, 5)
    renderWithRouter(<BottomNav items={fiveItems} />)

    const nav = screen.getByRole('navigation', { name: 'Основная навигация' })
    const links = within(nav).getAllByRole('link')
    expect(links).toHaveLength(5)
    expect(screen.queryByRole('button', { name: 'Ещё' })).toBeNull()
  })

  it('больше 5 пунктов: первые 4 + «Ещё», открывает меню остальных', async () => {
    renderWithRouter(<BottomNav items={items} />)

    const nav = screen.getByRole('navigation', { name: 'Основная навигация' })
    const visibleLinks = within(nav).getAllByRole('link')
    expect(visibleLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/map',
      '/regions',
      '/diagnosis',
    ])

    const moreButton = screen.getByRole('button', { name: 'Ещё' })
    expect(moreButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).toBeNull()

    await userEvent.click(moreButton)

    expect(moreButton).toHaveAttribute('aria-expanded', 'true')
    const menu = screen.getByRole('menu', { name: 'Ещё' })
    expect(menu).toBeInTheDocument()

    const menuLinks = within(menu).getAllByRole('menuitem')
    expect(menuLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/profile',
      '/new',
    ])
    // Фокус перешёл на первый пункт меню
    expect(menuLinks[0]).toHaveFocus()

    // Клик по пункту закрывает меню
    await userEvent.click(menuLinks[0])
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('закрывает меню по Escape и возвращает фокус на кнопку «Ещё»', async () => {
    renderWithRouter(<BottomNav items={items} />)

    const moreButton = screen.getByRole('button', { name: 'Ещё' })
    await userEvent.click(moreButton)

    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(moreButton).toHaveFocus()
  })

  it('закрывает меню при клике вне панели', async () => {
    renderWithRouter(
      <div>
        <button type="button">Снаружи</button>
        <BottomNav items={items} />
      </div>,
    )

    const moreButton = screen.getByRole('button', { name: 'Ещё' })
    await userEvent.click(moreButton)
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Снаружи' }))

    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('активный пункт внутри «Ещё» подсвечивает кнопку «Ещё» и наклоняет панель', () => {
    const activeInMore = items.map((item, index) => ({
      ...item,
      current: index === 5,
    }))
    renderWithRouter(<BottomNav items={activeInMore} />)

    const moreButton = screen.getByRole('button', { name: 'Ещё' })
    expect(moreButton).toHaveAttribute('aria-current', 'page')
    expect(moreButton).toHaveClass('text-accent')

    // Крайний правый пункт (индекс 4 из 5) -> наклон 4.00deg
    expect(screen.getByRole('list').style.getPropertyValue('--nav-tilt')).toBe(
      '4.00deg',
    )
  })

  it.each([
    ['к первому разделу', 0, 3, '-4.00deg'],
    ['к среднему разделу', 1, 3, '0.00deg'],
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
    ['/review', '.nav-icon-check'],
    ['/admin', '.nav-icon-check'],
  ])('у значка %s есть подвижная часть', (href, part) => {
    renderWithRouter(<BottomNav items={[{ label: 'Раздел', href }]} />)

    expect(screen.getByRole('link').querySelector(part)).not.toBeNull()
  })
})
