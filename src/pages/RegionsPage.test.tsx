import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { DistrictStats } from '@/api/regions'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { RegionsPage } from './RegionsPage'

const district = (
  iso: string,
  name: string,
  osmArea: number,
  mine = 0,
): DistrictStats => ({
  iso,
  name,
  area_ha: 50_000,
  osm_vineyards: Math.round(osmArea),
  osm_vineyard_area_ha: osmArea,
  osm_vineyard_share: osmArea / 50_000,
  my_vineyards: mine,
  my_vineyard_area_ha: mine * 8.4,
})

const stats = [
  district('MD-CU', 'Chișinău', 3744.9, 2),
  district('MD-IA', 'Ialoveni', 7386.7),
  district('MD-SO', 'Soroca', 3801.6),
  ...Array.from({ length: 9 }, (_, index) =>
    district(`MD-X${index}`, `Район ${index}`, 100 + index),
  ),
]

function renderPage() {
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/regions']}>
      <RegionsPage />
    </MemoryRouter>,
  )
}

describe('RegionsPage', () => {
  it('показывает сводку, график и таблицу районов', async () => {
    server.use(
      http.get('/api/v1/regions/stats', () => HttpResponse.json(stats)),
    )
    renderPage()

    expect(screen.getByRole('link', { name: 'Районы' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(await screen.findByText(/^15\s870$/)).toBeInTheDocument()
    expect(screen.getByText('2 · 16,8 га')).toBeInTheDocument()

    // На графике — десять районов с наибольшей площадью, по убыванию
    const chart = screen
      .getByRole('heading', {
        name: 'Районы с наибольшей площадью виноградников',
      })
      .closest('section')
    if (!chart) throw new Error('нет графика')
    const bars = within(chart).getAllByRole('listitem')
    expect(bars).toHaveLength(10)
    expect(bars[0]).toHaveTextContent(/Ialoveni7\s387\sга/)

    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(stats.length)
    expect(within(rows[0]).getAllByRole('cell')[0]).toHaveTextContent(
      'Ialoveni',
    )
    expect(within(rows[2]).getAllByRole('cell')[5]).toHaveTextContent(
      '2 · 16,8',
    )
    expect(within(rows[1]).getAllByRole('cell')[5]).toHaveTextContent('—')
  })

  it('пока данные загружаются, показывает заглушки', () => {
    server.use(
      http.get('/api/v1/regions/stats', () => new Promise<never>(() => {})),
    )
    renderPage()

    expect(screen.getAllByText('…')).toHaveLength(3)
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
  })

  it('без виноградников OSM не рисует пустой график', async () => {
    server.use(
      http.get('/api/v1/regions/stats', () =>
        HttpResponse.json([district('MD-CU', 'Chișinău', 0)]),
      ),
    )
    renderPage()

    expect(await screen.findByRole('cell', { name: 'Chișinău' })).toBeVisible()
    expect(
      screen.queryByRole('heading', {
        name: 'Районы с наибольшей площадью виноградников',
      }),
    ).not.toBeInTheDocument()
  })

  it('показывает причину ошибки сервера', async () => {
    server.use(
      http.get('/api/v1/regions/stats', () =>
        HttpResponse.json({ detail: 'Требуется вход' }, { status: 401 }),
      ),
    )
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Требуется вход')
  })
})
