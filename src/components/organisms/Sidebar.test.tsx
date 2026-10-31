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

  it('подсветка едет с прежнего раздела на текущий', () => {
    const { unmount } = renderWithRouter(<Sidebar items={items} />)
    unmount()
    renderWithRouter(
      <Sidebar
        items={[
          { label: 'Участки', href: '/vineyards' },
          { label: 'Диагностика', href: '/diagnosis', current: true },
        ]}
      />,
    )

    const pill = screen.getByTestId('sidebar-pill')
    expect(pill.style.getPropertyValue('--pill-from')).toBe('0rem')
    expect(pill.style.transform).toBe('translateY(3rem)')
  })

  it('без текущего раздела подсветки нет, и следующая не едет', () => {
    const { unmount } = renderWithRouter(
      <Sidebar items={[{ label: 'Участки', href: '/vineyards' }]} />,
    )
    expect(screen.queryByTestId('sidebar-pill')).toBeNull()
    unmount()

    renderWithRouter(<Sidebar items={items} />)

    expect(
      screen.getByTestId('sidebar-pill').style.getPropertyValue('--pill-from'),
    ).toBe('0rem')
  })
})
