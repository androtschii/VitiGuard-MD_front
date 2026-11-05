import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { FarmOverview } from './FarmOverview'

function vineyard(id: string, name: string, area_ha: number): Vineyard {
  return {
    id,
    name,
    area_ha,
    geometry: { type: 'MultiPolygon', coordinates: [] },
    variety: null,
    planting_year: null,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  }
}

function serve(vineyards: Vineyard[]) {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: vineyards,
        total: vineyards.length,
        page: 1,
        size: 100,
        pages: vineyards.length ? 1 : 0,
      }),
    ),
  )
}

function renderOverview(ui: ReactElement = <FarmOverview />) {
  return renderWithQueryClient(<MemoryRouter>{ui}</MemoryRouter>)
}

function tile(label: string) {
  return screen.getByText(label, { selector: 'dt' }).parentElement!
}

describe('FarmOverview', () => {
  it('сводит площадь и риск участков, опасные — первыми', async () => {
    serve([vineyard('a', 'Криково', 2.25), vineyard('b', 'Пуркарь', 1.5)])
    server.use(
      http.get('/api/v1/risks/today', () =>
        HttpResponse.json([
          {
            vineyard_id: 'b',
            day: '2026-06-10',
            downy: 'high',
            powdery: 'low',
          },
        ]),
      ),
    )
    renderOverview()

    const table = await screen.findByRole('table')
    expect(tile('Участков')).toHaveTextContent('2')
    expect(tile('Общая площадь')).toHaveTextContent(/3,8\sга/)
    await screen.findByText('высокий')
    expect(tile('В высоком риске')).toHaveTextContent('1')
    expect(tile('В среднем риске')).toHaveTextContent('0')
    const ring = screen.getByRole('region', { name: 'Участки по риску' })
    expect(ring).toHaveTextContent('высокий: 1')
    expect(ring).toHaveTextContent('нет оценки на сегодня: 1')
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows[0]).toHaveTextContent(/Пуркарь1,5.*высокий.*низкий/)
    expect(rows[1]).toHaveTextContent(/Криково2,25нет оценки на сегодня/)
    expect(screen.queryByText(/вне сезона/)).toBeNull()
  })

  it('вне сезона объясняет, почему оценок нет', async () => {
    serve([vineyard('a', 'Криково', 2.25)])
    renderOverview()

    expect(await screen.findByText(/Сегодня вне сезона/)).toBeInTheDocument()
    expect(tile('Риск болезней')).toHaveTextContent('Вне сезона')
    expect(tile('Риск болезней')).toHaveTextContent('с апреля по сентябрь')
    expect(tile('Последняя проверка')).toHaveTextContent('Пока нет')
    // Кольцо уровней без единой оценки ничего не говорит
    expect(screen.queryByText('Участки по риску')).toBeNull()
    // Одна колонка риска вместо двух, одна из которых пустая
    expect(
      screen.getByRole('columnheader', { name: 'Риск сегодня' }),
    ).toBeVisible()
    expect(screen.queryByRole('columnheader', { name: 'Оидиум' })).toBeNull()
    expect(screen.getByRole('cell', { name: 'вне сезона' })).toBeVisible()
  })

  it('вне сезона показывает последнюю проверку листа', async () => {
    serve([vineyard('a', 'Криково', 2.25)])
    server.use(
      http.get('/api/v1/diagnoses', () =>
        HttpResponse.json({
          items: [
            {
              id: 'd1',
              created_at: '2026-10-24T09:00:00Z',
              updated_at: '2026-10-24T09:00:00Z',
              vineyard_id: 'a',
              vineyard_name: 'Криково',
              model: 'efficientnet_b0',
              model_version: '1',
              disease: 'black_rot',
              confidence: 0.93,
              top: [],
              severity: null,
              overlays: [],
              location: null,
              review: null,
            },
          ],
          total: 1,
          page: 1,
          size: 12,
          pages: 1,
        }),
      ),
    )
    renderOverview()

    expect(await screen.findByText('Чёрная гниль')).toBeInTheDocument()
    expect(tile('Последняя проверка')).toHaveTextContent('24 октября · Криково')
  })

  it('без участков зовёт на карту', async () => {
    serve([])
    renderOverview()

    expect(await screen.findByText(/Участков пока нет/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Открыть карту' })).toHaveAttribute(
      'href',
      '/map',
    )
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('сообщает об ошибке загрузки', async () => {
    server.use(
      http.get('/api/v1/vineyards', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderOverview()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить участки',
    )
  })
})
