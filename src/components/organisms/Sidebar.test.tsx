import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'
import { useUiStore } from '@/store/ui'
import { Sidebar } from './Sidebar'

const items = [
  { label: 'Участки', href: '/vineyards', current: true },
  { label: 'Диагностика', href: '/diagnosis' },
]

describe('Sidebar', () => {
  beforeEach(() => {
    useUiStore.setState(useUiStore.getInitialState(), true)
  })

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

  it('закрытая на телефоне панель скрыта и без затемнения', () => {
    renderWithRouter(<Sidebar items={items} />)

    expect(document.getElementById('sidebar')).toHaveClass('hidden')
    expect(
      screen.queryByRole('button', { name: 'Закрыть меню' }),
    ).not.toBeInTheDocument()
  })

  it('открытая панель показывается поверх страницы', () => {
    useUiStore.setState({ isSidebarOpen: true })
    renderWithRouter(<Sidebar items={items} />)

    expect(document.getElementById('sidebar')).toHaveClass('fixed')
    expect(document.getElementById('sidebar')).not.toHaveClass('hidden')
  })

  it.each([
    [
      'клик по затемнению',
      () =>
        fireEvent.click(screen.getByRole('button', { name: 'Закрыть меню' })),
    ],
    ['Esc', () => fireEvent.keyDown(document, { key: 'Escape' })],
    [
      'переход по ссылке',
      () => fireEvent.click(screen.getByRole('link', { name: 'Диагностика' })),
    ],
  ])('закрывается: %s', (_, act) => {
    useUiStore.setState({ isSidebarOpen: true })
    renderWithRouter(<Sidebar items={items} />)

    act()

    expect(useUiStore.getState().isSidebarOpen).toBe(false)
  })

  it('другие клавиши панель не закрывают', () => {
    useUiStore.setState({ isSidebarOpen: true })
    renderWithRouter(<Sidebar items={items} />)

    fireEvent.keyDown(document, { key: 'Enter' })

    expect(useUiStore.getState().isSidebarOpen).toBe(true)
  })
})
