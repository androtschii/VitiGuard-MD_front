import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Map, Marker } from 'maplibre-gl'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import { MapContext } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'
import { server } from '@/test/server'
import { MapSearch } from './MapSearch'

type FakeMap = {
  fitBounds: ReturnType<typeof vi.fn>
  flyTo: ReturnType<typeof vi.fn>
}

type FakeMarker = { lngLat: unknown; isOnMap: boolean }

function vineyard(id: string, name: string, lon: number): Vineyard {
  return {
    id,
    name,
    area_ha: 1.69,
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [lon, 47.14],
            [lon + 0.002, 47.14],
            [lon + 0.002, 47.142],
            [lon, 47.14],
          ],
        ],
      ],
    },
    created_at: '2026-10-12T10:00:00Z',
    updated_at: '2026-10-12T10:00:00Z',
  }
}

const vineyards = [
  vineyard('v1', 'Криково, северный склон', 28.86),
  vineyard('v2', 'Криково, южный склон', 28.87),
  vineyard('v3', 'Пуркарь', 29.86),
]

async function setup(map: FakeMap | null = new Map({} as never) as never) {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: vineyards,
        total: 3,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
  )
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapContext value={map as never}>{children}</MapContext>
    </QueryClientProvider>
  )
  const view = render(<MapSearch />, { wrapper })
  // Список участков загружен — можно искать
  await waitFor(() =>
    expect(queryClient.getQueryState(['vineyards'])?.status).toBe('success'),
  )
  return { map, view }
}

const input = () =>
  screen.getByRole('combobox', { name: 'Поиск участка или координат' })
const marker = () =>
  vi.mocked(Marker).mock.instances.at(-1) as unknown as FakeMarker

describe('MapSearch', () => {
  beforeEach(() => {
    vi.mocked(Marker).mockClear()
  })

  it('пока карта не загружена, поиска нет', async () => {
    await setup(null)

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('находит участки по части названия без учёта регистра', async () => {
    await setup()

    await userEvent.type(input(), 'КРИКОВО')

    expect(input()).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['Криково, северный склон1,69 га', 'Криково, южный склон1,69 га'])
  })

  it('выбор участка приближает к нему карту и открывает его попап', async () => {
    const { map } = await setup()

    await userEvent.type(input(), 'пуркарь')
    await userEvent.click(screen.getByRole('option', { name: /Пуркарь/ }))

    expect(map?.fitBounds).toHaveBeenCalledWith(
      [
        [29.86, 47.14],
        [29.862, 47.142],
      ],
      expect.objectContaining({ maxZoom: 16 }),
    )
    expect(useMapStore.getState().selection).toEqual({
      id: 'v3',
      lngLat: [expect.closeTo(29.861), expect.closeTo(47.141)],
    })
    expect(input()).toHaveValue('Пуркарь')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('по координатам ставит метку и переносит карту', async () => {
    const { map } = await setup()

    await userEvent.type(input(), '47.1405, 28.861{Enter}')

    expect(map?.flyTo).toHaveBeenCalledWith({
      center: [28.861, 47.1405],
      zoom: 15,
    })
    expect(marker().lngLat).toEqual([28.861, 47.1405])
    expect(marker().isOnMap).toBe(true)
    expect(useMapStore.getState().selection).toBeNull()
  })

  it('управляется стрелками и Enter', async () => {
    const { map } = await setup()

    await userEvent.type(input(), 'криково')
    await userEvent.keyboard('{ArrowDown}')
    const second = screen.getByRole('option', { name: /южный/ })
    expect(second).toHaveAttribute('aria-selected', 'true')
    expect(input()).toHaveAttribute('aria-activedescendant', second.id)

    await userEvent.keyboard('{ArrowUp}{ArrowUp}{Enter}')

    // С первого варианта стрелка вверх переходит на последний
    expect(useMapStore.getState().selection?.id).toBe('v2')
    expect(map?.fitBounds).toHaveBeenCalledOnce()
  })

  it('Esc сначала закрывает список, потом очищает поле', async () => {
    await setup()

    await userEvent.type(input(), 'криково{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input()).toHaveValue('криково')

    await userEvent.keyboard('{Escape}')
    expect(input()).toHaveValue('')
  })

  it('сообщает, что ничего не найдено', async () => {
    await setup()

    await userEvent.type(input(), 'Милештий{ArrowDown}{Enter}')

    expect(screen.getByRole('option')).toHaveTextContent('Ничего не найдено')
    expect(useMapStore.getState().selection).toBeNull()
  })

  it('список закрывается, когда поле теряет фокус', async () => {
    await setup()

    await userEvent.type(input(), 'криково')
    await userEvent.tab()

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('убирает метку при уходе со страницы', async () => {
    const { view } = await setup()
    await userEvent.type(input(), '47.14 28.86{Enter}')

    view.unmount()

    expect(marker().isOnMap).toBe(false)
  })
})
