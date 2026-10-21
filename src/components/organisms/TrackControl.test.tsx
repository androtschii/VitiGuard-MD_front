import type { FeatureCollection } from 'geojson'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Map } from 'maplibre-gl'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MapContext } from '@/lib/mapContext'
import * as mapImage from '@/lib/mapImage'
import { deleteTrack, listTracks, saveTrack } from '@/lib/trackStore'
import { TrackControl } from './TrackControl'

type FakeMap = {
  addLayer: ReturnType<typeof vi.fn>
  removeSource: ReturnType<typeof vi.fn>
  getSource: ReturnType<typeof vi.fn>
  fitBounds: ReturnType<typeof vi.fn>
}

type Success = (position: {
  coords: { longitude: number; latitude: number; accuracy: number }
  timestamp: number
}) => void
type Failure = (error: { code: number; PERMISSION_DENIED: number }) => void

const START = Date.parse('2026-06-10T07:00:00Z')

function fakeGeolocation() {
  const watchers: { success: Success; failure: Failure }[] = []
  const clearWatch = vi.fn()
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      watchPosition: (success: Success, failure: Failure) =>
        watchers.push({ success, failure }),
      clearWatch,
    },
  })
  // Шаг — около 11 м на север, раз в минуту
  const move = (step: number, accuracy = 5) =>
    act(() =>
      watchers.at(-1)?.success({
        coords: {
          longitude: 28.86,
          latitude: 47.14 + step * 0.0001,
          accuracy,
        },
        timestamp: START + step * 60_000,
      }),
    )
  const fail = (code: number) =>
    act(() => watchers.at(-1)?.failure({ code, PERMISSION_DENIED: 1 }))
  return { move, fail, clearWatch }
}

function setup(map: FakeMap | null = new Map({} as never) as never) {
  const setData = vi.fn().mockResolvedValue(undefined)
  map?.getSource.mockReturnValue({ setData })
  const client = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MapContext value={map as never}>{children}</MapContext>
    </QueryClientProvider>
  )
  const view = render(<TrackControl />, { wrapper })
  return { map, view, setData, user: userEvent.setup() }
}

beforeEach(() => {
  // Подменяются только часы: таймеры и промисы идут как обычно
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(START)
})

afterEach(async () => {
  // Сначала размонтирование: незаконченный обход сохранился бы после очистки
  cleanup()
  vi.useRealTimers()
  for (const track of await listTracks()) await deleteTrack(track.id)
  Reflect.deleteProperty(navigator, 'geolocation')
  Reflect.deleteProperty(navigator, 'wakeLock')
})

describe('TrackControl', () => {
  it('без карты ничего не показывает', () => {
    const { view } = setup(null)

    expect(view.container).toBeEmptyDOMElement()
  })

  it('записывает обход и сохраняет его на устройстве', async () => {
    const gps = fakeGeolocation()
    const release = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: vi.fn().mockResolvedValue({ release }) },
    })
    const { user, map, setData } = setup()

    await user.click(screen.getByRole('button', { name: 'Записать обход' }))
    expect(screen.getByText(/Ищем спутники/)).toBeInTheDocument()
    expect(map?.addLayer).toHaveBeenCalledTimes(2)

    gps.move(0)
    // Неточная точка не попадает в трек
    gps.move(1, 60)
    gps.move(2)
    vi.setSystemTime(START + 2 * 60_000)
    await act(() => new Promise((resolve) => setTimeout(resolve, 1100)))

    expect(screen.getByText(/Идёт запись/)).toBeInTheDocument()
    expect(screen.getByText('22 м · 2 минуты')).toBeInTheDocument()
    const drawn = setData.mock.lastCall?.[0] as FeatureCollection
    expect(drawn.features.map((feature) => feature.geometry.type)).toEqual([
      'LineString',
      'Point',
    ])

    await user.click(
      screen.getByRole('button', { name: 'Остановить и сохранить' }),
    )

    expect(gps.clearWatch).toHaveBeenCalled()
    await waitFor(() => expect(release).toHaveBeenCalled())
    const saved = await screen.findByRole('list', {
      name: 'Сохранённые обходы',
    })
    expect(saved).toHaveTextContent('22 м · 2 минуты')
    expect((await listTracks())[0]?.points).toHaveLength(2)
    expect(map?.removeSource).toHaveBeenCalledWith('track')
  })

  it('без точек обход не сохраняется', async () => {
    fakeGeolocation()
    // Браузер может отказать в блокировке экрана — запись идёт и без неё
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Записать обход' }))
    await user.click(
      screen.getByRole('button', { name: 'Остановить и сохранить' }),
    )

    expect(await listTracks()).toEqual([])
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('объясняет, почему нет геопозиции', async () => {
    const gps = fakeGeolocation()
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Записать обход' }))

    gps.fail(1)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Нет доступа к геопозиции',
    )

    gps.fail(3)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Геопозиция на этом устройстве недоступна',
    )
  })

  it('без геолокации в браузере запись не начинается', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Записать обход' }))

    expect(screen.getByRole('alert')).toHaveTextContent('недоступна')
    expect(
      screen.getByRole('button', { name: 'Записать обход' }),
    ).toBeInTheDocument()
  })

  it('уход со страницы посреди обхода сохраняет записанное', async () => {
    const gps = fakeGeolocation()
    const { user, view } = setup()
    await user.click(screen.getByRole('button', { name: 'Записать обход' }))
    gps.move(0)
    gps.move(1)

    view.unmount()

    await waitFor(async () => expect(await listTracks()).toHaveLength(1))
  })

  it('сохранённый обход показывается на карте, выгружается и удаляется', async () => {
    const points = [0, 1, 2].map((step) => ({
      lng: 28.86 + step * 0.01,
      lat: 47.14,
      accuracy: 5,
      time: START + step * 60_000,
    }))
    await saveTrack({ startedAt: '2026-06-10T07:00:00.000Z', points })
    const download = vi.spyOn(mapImage, 'saveBlob').mockImplementation(() => {})
    const { user, map, setData } = setup()

    await user.click(await screen.findByRole('button', { name: 'Показать' }))

    expect(screen.getByRole('list')).toHaveTextContent(/1,51 км · 2 минуты/)
    expect(map?.fitBounds).toHaveBeenCalledWith(
      [
        [28.86, 47.14],
        [28.88, 47.14],
      ],
      { padding: 40, maxZoom: 18 },
    )
    expect(setData).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Скрыть' }))
    expect(map?.removeSource).toHaveBeenCalledWith('track')

    await user.click(screen.getByRole('button', { name: 'GPX' }))
    const [blob, name] = download.mock.calls[0] ?? []
    expect(name).toBe('vitiguard-track-2026-06-10.gpx')
    expect(await blob?.text()).toContain('<trkseg>')

    await user.click(screen.getByRole('button', { name: 'Показать' }))
    await user.click(screen.getByRole('button', { name: 'Удалить' }))

    await waitFor(() => expect(screen.queryByRole('list')).toBeNull())
    expect(await listTracks()).toEqual([])
  })

  it('удаление скрытого обхода не трогает карту', async () => {
    await saveTrack({
      startedAt: '2026-06-10T07:00:00.000Z',
      points: [{ lng: 28.86, lat: 47.14, accuracy: 5, time: START }],
    })
    const { user, map } = setup()

    await user.click(await screen.findByRole('button', { name: 'Удалить' }))

    await waitFor(() => expect(screen.queryByRole('list')).toBeNull())
    expect(map?.addLayer).not.toHaveBeenCalled()
  })
})
