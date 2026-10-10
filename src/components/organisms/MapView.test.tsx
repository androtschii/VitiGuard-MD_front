import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Map, ScaleControl } from 'maplibre-gl'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { MOLDOVA_BOUNDS } from '@/lib/map'
import { useMapStore } from '@/store/map'
import { MapView } from './MapView'

type FakeMap = {
  options: Record<string, unknown> & { locale: Record<string, string> }
  addControl: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
  setLayoutProperty: ReturnType<typeof vi.fn>
  isStyleLoaded: ReturnType<typeof vi.fn>
  once: ReturnType<typeof vi.fn>
}

const createdMaps = () => vi.mocked(Map).mock.instances as unknown as FakeMap[]

function enableWebGL(enabled: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    enabled ? ({} as RenderingContext) : null,
  )
}

describe('MapView', () => {
  beforeEach(() => {
    vi.mocked(Map).mockClear()
    enableWebGL(true)
  })

  it('открывает карту на Молдове и не даёт увести её далеко', () => {
    render(<MapView />)

    const [map] = createdMaps()
    expect(map?.options).toMatchObject({
      bounds: MOLDOVA_BOUNDS,
      maxBounds: [
        [25.5, 44.9],
        [31.5, 48.9],
      ],
    })
  })

  it('добавляет масштаб, кнопки приближения и полноэкранный режим', () => {
    render(<MapView />)

    const [map] = createdMaps()
    expect(map?.addControl).toHaveBeenCalledTimes(3)
    expect(ScaleControl).toHaveBeenCalledWith({ unit: 'metric' })
  })

  it('подписывает кнопки карты на языке интерфейса', async () => {
    render(<MapView />)
    expect(createdMaps()[0]?.options.locale['NavigationControl.ZoomIn']).toBe(
      'Приблизить',
    )

    await act(() => i18n.changeLanguage('ro'))

    const maps = createdMaps()
    expect(maps[0]?.remove).toHaveBeenCalledOnce()
    expect(maps.at(-1)?.options.locale['NavigationControl.ZoomIn']).toBe(
      'Apropie',
    )
  })

  it('удаляет карту при уходе со страницы', () => {
    const { unmount } = render(<MapView />)

    unmount()

    expect(createdMaps()[0]?.remove).toHaveBeenCalledOnce()
  })

  it('без WebGL объясняет, почему карты нет', () => {
    enableWebGL(false)
    render(<MapView />)

    expect(screen.getByRole('alert')).toHaveTextContent('нужна поддержка WebGL')
    expect(Map).not.toHaveBeenCalled()
  })

  it('создаёт карту с сохранённой подложкой', () => {
    useMapStore.setState({ basemap: 'hybrid' })
    render(<MapView />)

    const style = createdMaps()[0]?.options.style as {
      layers: { id: string; layout: { visibility: string } }[]
    }
    const visible = style.layers
      .filter((layer) => layer.layout.visibility === 'visible')
      .map((layer) => layer.id)
    expect(visible).toEqual(['satellite', 'hybrid-roads', 'hybrid-places'])
  })

  it('меняет подложку без пересоздания карты', async () => {
    render(<MapView />)

    await userEvent.click(screen.getByRole('radio', { name: 'Спутник' }))

    const maps = createdMaps()
    expect(maps).toHaveLength(1)
    expect(maps[0]?.setLayoutProperty).toHaveBeenCalledWith(
      'satellite',
      'visibility',
      'visible',
    )
    expect(maps[0]?.setLayoutProperty).toHaveBeenCalledWith(
      'scheme',
      'visibility',
      'none',
    )
    expect(useMapStore.getState().basemap).toBe('satellite')
  })

  it('выбор, сделанный до загрузки стиля, применяет после неё', async () => {
    render(<MapView />)
    const [map] = createdMaps()
    map?.isStyleLoaded.mockReturnValue(false)
    map?.setLayoutProperty.mockClear()

    await userEvent.click(screen.getByRole('radio', { name: 'Гибрид' }))

    expect(map?.setLayoutProperty).not.toHaveBeenCalled()
    expect(map?.once).toHaveBeenCalledWith('style.load', expect.any(Function))
    const apply = map?.once.mock.calls[0]?.[1] as () => void
    apply()
    expect(map?.setLayoutProperty).toHaveBeenCalledWith(
      'hybrid-places',
      'visibility',
      'visible',
    )
  })
})
