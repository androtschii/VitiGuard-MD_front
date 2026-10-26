import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { VineyardCard } from './VineyardCard'

const vineyard: Vineyard = {
  id: 'vineyard-1',
  name: 'Криково',
  geometry: { type: 'MultiPolygon', coordinates: [] },
  area_ha: 1.6912,
  variety: { id: 'merlot', name: 'Merlot', berry_color: 'red' },
  planting_year: 2015,
  created_at: '2026-10-12T10:00:00Z',
  updated_at: '2026-10-12T10:00:00Z',
}

function renderCard(overrides: Partial<Vineyard> = {}) {
  const onDeleted = vi.fn()
  renderWithQueryClient(
    <VineyardCard
      vineyard={{ ...vineyard, ...overrides }}
      point={[28.8614, 47.1405]}
      onDeleted={onDeleted}
    />,
  )
  return { onDeleted, user: userEvent.setup() }
}

describe('VineyardCard', () => {
  it('показывает паспорт участка, район, погоду и окрестности', async () => {
    let weatherQuery = ''
    server.use(
      http.get('/api/v1/weather/current', ({ request }) => {
        weatherQuery = new URL(request.url).search
        return HttpResponse.json({
          observed_at: '2026-10-16T14:30:00Z',
          temperature_c: 9.6,
          relative_humidity: 71,
          precipitation_mm: 0,
        })
      }),
    )
    renderCard()

    expect(screen.getByRole('heading', { name: 'Криково' })).toBeInTheDocument()
    expect(screen.getByText('Площадь: 1,69 га')).toBeInTheDocument()
    expect(screen.getByText('Сорт: Merlot')).toBeInTheDocument()
    expect(await screen.findByText('Район: Chișinău')).toBeInTheDocument()
    expect(
      await screen.findByText('9,6 °C, влажность 71 %, осадки 0 мм'),
    ).toBeInTheDocument()
    // Точка округлена до 0,01°: соседние клики берут погоду из кэша
    expect(weatherQuery).toBe('?latitude=47.14&longitude=28.86')
    expect(
      screen.getByText('Виноградников OpenStreetMap в радиусе 1 км: 8'),
    ).toBeInTheDocument()
    expect(screen.getByText('Ближайший — в 27 м')).toBeInTheDocument()
    expect(
      screen.getByText('Совпадает с разметкой OpenStreetMap на 42 %'),
    ).toBeInTheDocument()
  })

  it('без района, ближайшего виноградника и совпадения строки не показывает', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/context', () =>
        HttpResponse.json({
          osm_overlap_ratio: 0,
          osm_vineyards_within_1km: 0,
          nearest_osm_distance_m: null,
          district: null,
        }),
      ),
    )
    renderCard({ variety: null, planting_year: null })

    expect(
      await screen.findByText('Виноградников OpenStreetMap в радиусе 1 км: 0'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/^Район/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Ближайший/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Совпадает/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Сорт/)).not.toBeInTheDocument()
  })

  it('сообщает, если погода недоступна', async () => {
    server.use(
      http.get('/api/v1/weather/current', () =>
        HttpResponse.json({ detail: 'Open-Meteo недоступен' }, { status: 502 }),
      ),
    )
    renderCard()

    expect(
      within(screen.getByRole('region', { name: 'Погода сейчас' })).getByText(
        'Загрузка…',
      ),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Погода сейчас недоступна'),
    ).toBeInTheDocument()
  })

  it('скачивает границы в выбранном формате', async () => {
    const formats: (string | null)[] = []
    server.use(
      http.get('/api/v1/vineyards/:id/export', ({ request }) => {
        formats.push(new URL(request.url).searchParams.get('format'))
        return new HttpResponse('{}', {
          headers: { 'Content-Type': 'application/geo+json' },
        })
      }),
    )
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'GeoJSON' }))
    await user.click(screen.getByRole('button', { name: 'Shapefile' }))

    await waitFor(() => expect(click).toHaveBeenCalledTimes(2))
    expect(formats).toEqual(['geojson', 'shapefile'])
    click.mockRestore()
  })

  it('сообщает, если скачать границы не удалось', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/export', () =>
        HttpResponse.json({ detail: 'Нет' }, { status: 500 }),
      ),
    )
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'GeoJSON' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось скачать границы',
    )
  })

  it('удаляет участок только после подтверждения', async () => {
    const deleted = vi.fn()
    server.use(
      http.delete('/api/v1/vineyards/:id', ({ params }) => {
        deleted(params.id)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { user, onDeleted } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Удалить участок' }))
    expect(
      screen.getByText('Удалить участок? Это нельзя отменить.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(deleted).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Удалить участок' }))
    await user.click(screen.getByRole('button', { name: 'Удалить участок' }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalled())
    expect(deleted).toHaveBeenCalledWith('vineyard-1')
  })

  it('показывает причину, если удалить не вышло', async () => {
    server.use(
      http.delete('/api/v1/vineyards/:id', () =>
        HttpResponse.json({ detail: 'Участок не найден' }, { status: 404 }),
      ),
    )
    const { user, onDeleted } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Удалить участок' }))
    await user.click(screen.getByRole('button', { name: 'Удалить участок' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Участок не найден',
    )
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('открывает окно динамики вегетации', async () => {
    server.use(
      http.get('/api/v1/vineyards/:id/vegetation', () => HttpResponse.json([])),
    )
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Динамика вегетации' }))

    expect(
      screen.getByRole('dialog', { name: 'Динамика вегетации: Криково' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('открывает окно обработок и плана', async () => {
    const { user } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Обработки и план' }))

    expect(
      screen.getByRole('dialog', { name: 'Обработки и план: Криково' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
