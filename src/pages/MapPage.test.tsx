import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Map } from 'maplibre-gl'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { lastDraw, parcel } from '@/test/terraDraw'
import { MapPage } from './MapPage'

describe('MapPage', () => {
  it('показывает карту в кабинете и отмечает раздел в навигации', () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/map']}>
        <MapPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Карта виноградников' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Карта' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Главная' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument()
  })

  it('сохраняет нарисованный участок под введённым названием', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as RenderingContext,
    )
    let saved: unknown
    server.use(
      http.post('/api/v1/vineyards', async ({ request }) => {
        saved = await request.json()
        return HttpResponse.json(
          { id: 'vineyard-1', name: 'Криково' },
          { status: 201 },
        )
      }),
    )
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/map']}>
        <MapPage />
      </MemoryRouter>,
    )

    // Карта «загрузилась»: заглушка MapLibre вызывает подписку на load
    const map = vi.mocked(Map).mock.instances.at(-1) as unknown as {
      once: ReturnType<typeof vi.fn>
    }
    const onLoad = map.once.mock.calls.find(
      ([event]) => event === 'style.load',
    )?.[1] as () => void
    act(() => onLoad())

    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )
    const draw = lastDraw()
    draw.features.parcel = parcel
    draw.emit('finish', 'parcel')
    await userEvent.type(screen.getByLabelText(/Название участка/), 'Криково')
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить участок' }),
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Участок «Криково» сохранён',
    )
    expect(saved).toEqual({
      name: 'Криково',
      variety_id: null,
      planting_year: null,
      geometry: {
        type: 'MultiPolygon',
        coordinates: [parcel.geometry.coordinates],
      },
    })
    // Контур убран с карты, панель снова предлагает нарисовать участок
    expect(draw.clear).toHaveBeenCalledOnce()
    expect(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    ).toBeInTheDocument()
  })
})
