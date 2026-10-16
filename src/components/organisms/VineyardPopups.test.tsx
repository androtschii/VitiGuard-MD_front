import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import { Map, Popup } from 'maplibre-gl'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import { MapContext } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'
import { server } from '@/test/server'
import { VineyardPopups } from './VineyardPopups'

type Handler = (event: unknown) => void

type FakeMap = {
  easeTo: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  canvas: { style: { cursor: string } }
}

type FakePopup = {
  options: { closeButton?: boolean; anchor?: string }
  text: string
  content: HTMLElement | null
  isOpen: boolean
  listeners: Record<string, () => void>
  remove: ReturnType<typeof vi.fn>
}

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

function event(properties: Record<string, unknown>) {
  return {
    features: [{ properties }],
    lngLat: { lng: 28.861, lat: 47.1405 },
  }
}

function setup() {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: [vineyard],
        total: 1,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
  )
  const map = new Map({} as never) as unknown as FakeMap
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapContext value={map as never}>{children}</MapContext>
    </QueryClientProvider>
  )
  const view = render(<VineyardPopups />, { wrapper })
  const handler = (name: string) =>
    map.on.mock.calls.find(
      ([type, layer]) => type === name && layer === 'vineyards-fill',
    )?.[2] as Handler
  const popups = () => vi.mocked(Popup).mock.instances as unknown as FakePopup[]
  return { map, view, handler, popups, queryClient }
}

describe('VineyardPopups', () => {
  beforeEach(() => {
    vi.mocked(Popup).mockClear()
  })

  it('при наведении показывает название и меняет курсор', () => {
    const { map, handler, popups } = setup()

    act(() =>
      handler('mousemove')(event({ id: 'vineyard-1', name: 'Криково' })),
    )

    const [tooltip] = popups()
    expect(tooltip?.options.closeButton).toBe(false)
    expect(tooltip?.text).toBe('Криково')
    expect(tooltip?.isOpen).toBe(true)
    expect(map.canvas.style.cursor).toBe('pointer')

    act(() => handler('mouseleave')({}))

    expect(tooltip?.isOpen).toBe(false)
    expect(map.canvas.style.cursor).toBe('')
  })

  it('по клику открывает попап с площадью и датой', async () => {
    const { map, handler, popups } = setup()
    await waitFor(() => expect(handler('click')).toBeDefined())

    act(() => handler('click')(event({ id: 'vineyard-1', name: 'Криково' })))

    // Содержимое рисуется порталом в контейнер попапа
    const details = popups().at(-1)
    const content = within(details?.content ?? document.body)
    await waitFor(() =>
      expect(
        content.getByRole('heading', { name: 'Криково' }),
      ).toBeInTheDocument(),
    )
    expect(content.getByText('Площадь: 1,69 га')).toBeInTheDocument()
    expect(content.getByText('Добавлен 12 октября 2026 г.')).toBeInTheDocument()
    expect(content.getByText('Сорт: Merlot')).toBeInTheDocument()
    expect(content.getByText('Посажен в 2015 году')).toBeInTheDocument()
    // Карточка над точкой, а карта сдвинута, чтобы карточка поместилась
    expect(details?.options).toMatchObject({ anchor: 'bottom' })
    expect(map.easeTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [28.861, 47.1405], offset: [0, 160] }),
    )

    // Закрытие попапа сбрасывает выбор
    act(() => details?.listeners.close?.())
    expect(
      content.queryByRole('heading', { name: 'Криково' }),
    ).not.toBeInTheDocument()
  })

  it('после удаления участка карточка закрывается', async () => {
    server.use(
      http.delete(
        '/api/v1/vineyards/:id',
        () => new HttpResponse(null, { status: 204 }),
      ),
    )
    const { handler, popups } = setup()
    await waitFor(() => expect(handler('click')).toBeDefined())
    act(() => handler('click')(event({ id: 'vineyard-1', name: 'Криково' })))
    const content = within(popups().at(-1)?.content ?? document.body)
    const remove = await content.findByRole('button', {
      name: 'Удалить участок',
    })

    act(() => remove.click())
    act(() => content.getByRole('button', { name: 'Удалить участок' }).click())

    await waitFor(() => expect(useMapStore.getState().selection).toBeNull())
  })

  it('пока рисуется контур, участки не реагируют', () => {
    const { handler, popups } = setup()
    useMapStore.setState({ isDrawing: true })

    act(() =>
      handler('mousemove')(event({ id: 'vineyard-1', name: 'Криково' })),
    )
    act(() => handler('click')(event({ id: 'vineyard-1', name: 'Криково' })))

    expect(popups()).toHaveLength(1)
    expect(popups()[0]?.isOpen).toBe(false)
    useMapStore.setState({ isDrawing: false })
  })

  it('объект без id и неизвестный участок попап не открывают', async () => {
    const { handler } = setup()

    act(() => handler('mousemove')(event({})))
    act(() => handler('click')(event({})))
    act(() => handler('click')(event({ id: 'deleted' })))

    await waitFor(() => expect(screen.queryByRole('heading')).toBeNull())
  })

  it('отписывается от карты при уходе со страницы', () => {
    const { map, view } = setup()

    view.unmount()

    expect(map.off.mock.calls.map(([type]) => type as string)).toEqual([
      'mousemove',
      'mouseleave',
      'click',
    ])
  })

  it('пока карта не загружена, ни на что не подписывается', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MapContext value={null}>
          <VineyardPopups />
        </MapContext>
      </QueryClientProvider>,
    )

    expect(Popup).not.toHaveBeenCalled()
  })
})
