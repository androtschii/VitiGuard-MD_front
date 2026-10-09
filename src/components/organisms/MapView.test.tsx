import { render, screen } from '@testing-library/react'
import { Map, ScaleControl } from 'maplibre-gl'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { MOLDOVA_BOUNDS } from '@/lib/map'
import { MapView } from './MapView'

type FakeMap = {
  options: Record<string, unknown> & { locale: Record<string, string> }
  addControl: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
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
})
