import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useMapStore } from '@/store/map'
import { MapToolbar } from './MapToolbar'

function renderToolbar() {
  render(
    <MapToolbar
      tools={<button type="button">Поиск</button>}
      layers={<p>Фильтр по сорту</p>}
    />,
  )
  return userEvent.setup()
}

function layersBlock() {
  const block = screen.getByText('Фильтры и слои').closest('details')
  if (!block) throw new Error('нет блока фильтров')
  return block
}

describe('MapToolbar', () => {
  it('прячет панель целиком и возвращает её', async () => {
    const user = renderToolbar()

    await user.click(screen.getByRole('button', { name: 'Скрыть панель' }))

    expect(
      screen.queryByRole('button', { name: 'Поиск' }),
    ).not.toBeInTheDocument()
    const show = screen.getByRole('button', { name: 'Инструменты' })
    expect(show).toHaveAttribute('aria-expanded', 'false')

    await user.click(show)

    expect(screen.getByRole('button', { name: 'Поиск' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Скрыть панель' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('фильтры и слои по умолчанию свёрнуты и раскрываются', () => {
    renderToolbar()
    const block = layersBlock()

    expect(block).not.toHaveAttribute('open')

    block.open = true
    fireEvent(block, new Event('toggle'))

    expect(layersBlock()).toHaveAttribute('open')
  })

  it('включённый фильтр не прячется', () => {
    useMapStore.setState({
      filter: { variety: 'merlot', minArea: null, maxArea: null },
    })
    renderToolbar()

    expect(layersBlock()).toHaveAttribute('open')
  })
})
