import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { useMapStore } from '@/store/map'
import { CommandPalette } from './CommandPalette'

const plot = (id: string, name: string, coordinates: unknown) => ({
  id,
  name,
  area_ha: 1,
  geometry: { type: 'MultiPolygon', coordinates },
  variety: null,
  planting_year: null,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
})
const SQUARE = [
  [
    [
      [28, 47],
      [29, 47],
      [29, 48],
      [28, 47],
    ],
  ],
]

function Where() {
  return <p data-testid="path">{useLocation().pathname}</p>
}

function renderPalette() {
  renderWithQueryClient(
    <MemoryRouter>
      <CommandPalette
        items={[
          { label: 'Главная', href: '/' },
          { label: 'История', href: '/history' },
        ]}
      />
      <Where />
    </MemoryRouter>,
  )
}

const openByKeyboard = () =>
  fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
const search = () => screen.getByRole('combobox', { hidden: true })

describe('CommandPalette', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '')
    })
    HTMLDialogElement.prototype.close = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.removeAttribute('open')
    })
    server.use(
      http.get('/api/v1/vineyards', () =>
        HttpResponse.json({
          items: [plot('a', 'Криково', SQUARE), plot('b', 'Пустой', [])],
          total: 2,
          page: 1,
          size: 100,
          pages: 1,
        }),
      ),
    )
  })

  afterEach(() => {
    useMapStore.setState({ selection: null, showWineries: false })
  })

  it('открывается по Ctrl+K, а другие клавиши не трогает', () => {
    renderPalette()

    fireEvent.keyDown(document, { key: 'k' })
    expect(screen.queryByRole('combobox', { hidden: true })).toBeNull()

    openByKeyboard()
    expect(search()).toBeInTheDocument()
  })

  it('открывается кнопкой и закрывается', async () => {
    renderPalette()

    await userEvent.click(screen.getByRole('button', { name: 'Быстрый поиск' }))
    expect(search()).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Закрыть', hidden: true }),
    )
    expect(screen.queryByRole('combobox', { hidden: true })).toBeNull()
  })

  it('стрелки и Enter ведут в раздел', async () => {
    renderPalette()
    openByKeyboard()
    expect(search()).toHaveAttribute('autofocus')
    search().focus()

    await userEvent.keyboard('{ArrowUp}{ArrowDown}{Enter}')

    expect(screen.getByTestId('path')).toHaveTextContent('/history')
    expect(screen.queryByRole('combobox', { hidden: true })).toBeNull()
  })

  it('находит участок и открывает его на карте', async () => {
    renderPalette()
    openByKeyboard()

    await userEvent.type(search(), 'крик')
    await userEvent.click(
      await screen.findByRole('option', { name: /Криково/, hidden: true }),
    )

    expect(screen.getByTestId('path')).toHaveTextContent('/map')
    expect(useMapStore.getState().selection).toEqual({
      id: 'a',
      lngLat: [28.5, 47.5],
    })
  })

  it('участок без контура просто открывает карту', async () => {
    renderPalette()
    openByKeyboard()

    await userEvent.type(search(), 'пуст')
    await userEvent.click(
      await screen.findByRole('option', { name: /Пустой/, hidden: true }),
    )

    expect(screen.getByTestId('path')).toHaveTextContent('/map')
    expect(useMapStore.getState().selection).toBeNull()
  })

  it.each([
    ['винодел', '/map'],
    ['сравнить', '/compare'],
    ['подсказки', '/tips'],
  ])('действие «%s» ведёт на %s', async (text, path) => {
    renderPalette()
    openByKeyboard()

    await userEvent.type(search(), text)
    await userEvent.hover(screen.getAllByRole('option', { hidden: true })[0])
    await userEvent.keyboard('{Enter}')

    expect(screen.getByTestId('path')).toHaveTextContent(path)
  })

  it('слой виноделен включается действием', async () => {
    renderPalette()
    openByKeyboard()

    await userEvent.type(search(), 'винодел{Enter}')

    expect(useMapStore.getState().showWineries).toBe(true)
  })

  it('говорит, что ничего не нашлось, и Enter тогда ничего не делает', async () => {
    renderPalette()
    openByKeyboard()

    await userEvent.type(search(), 'нет такого{Enter}')

    expect(screen.getByText('Ничего не нашлось')).toBeInTheDocument()
    expect(search()).not.toHaveAttribute('aria-activedescendant')
    expect(screen.getByTestId('path')).toHaveTextContent('/')
  })

  it('игнорирует прочие клавиши в поле', async () => {
    renderPalette()
    openByKeyboard()
    search().focus()

    await userEvent.keyboard('{Home}')

    expect(screen.getAllByRole('option', { hidden: true })[0]).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})
