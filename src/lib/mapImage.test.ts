import type { Map } from 'maplibre-gl'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  attributionText,
  captureMap,
  mapFileName,
  saveBlob,
  toJpegBytes,
  toPngBlob,
  withAttribution,
  withTitle,
} from './mapImage'

function fakeContext() {
  return {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    font: '',
    fillStyle: '',
    textBaseline: '',
  }
}

function source(width = 800, height = 600, clientWidth = 400) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  Object.defineProperty(canvas, 'clientWidth', { value: clientWidth })
  return canvas
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('mapImage', () => {
  it('берёт подпись источников из углового блока карты', () => {
    const container = document.createElement('div')
    container.innerHTML =
      '<div class="maplibregl-ctrl-attrib-inner">© OpenStreetMap\n | geoBoundaries</div>'

    expect(attributionText(container)).toBe('© OpenStreetMap | geoBoundaries')
    expect(attributionText(document.createElement('div'))).toBe('')
  })

  it('имя файла — с датой', () => {
    expect(mapFileName(new Date('2026-10-18T12:00:00Z'))).toBe(
      'vitiguard-map-2026-10-18.png',
    )
  })

  it('копирует кадр и подписывает источники с учётом плотности пикселей', () => {
    const context = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as never,
    )
    const frame = source()

    const canvas = withAttribution(frame, '© OpenStreetMap')

    expect([canvas.width, canvas.height]).toEqual([800, 600])
    expect(context.drawImage).toHaveBeenCalledWith(frame, 0, 0)
    // Экран с плотностью 2: шрифт 12 px становится 24 px
    expect(context.font).toBe('24px sans-serif')
    expect(context.fillRect).toHaveBeenCalledWith(676, 552, 124, 48)
    expect(context.fillText).toHaveBeenCalledWith('© OpenStreetMap', 688, 576)
  })

  it('без подписи только копирует кадр', () => {
    const context = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as never,
    )

    withAttribution(source(10, 10, 0), '')

    expect(context.fillText).not.toHaveBeenCalled()
  })

  it('без Canvas 2D сообщает об ошибке', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

    expect(() => withAttribution(source(), '')).toThrow('Canvas 2D')
  })

  it('читает пиксели в кадре отрисовки', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeContext() as never,
    )
    let onRender = () => {}
    const map = {
      once: vi.fn((_: string, handler: () => void) => {
        onRender = handler
      }),
      triggerRepaint: vi.fn(() => onRender()),
      getCanvas: () => source(),
      getContainer: () => document.createElement('div'),
    }

    const canvas = await captureMap(map as unknown as Map)

    expect(map.once).toHaveBeenCalledWith('render', expect.any(Function))
    expect(canvas.width).toBe(800)
  })

  it('передаёт ошибку кадра', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    let onRender = () => {}
    const map = {
      once: (_: string, handler: () => void) => {
        onRender = handler
      },
      triggerRepaint: () => onRender(),
      getCanvas: () => source(),
      getContainer: () => document.createElement('div'),
    }

    await expect(captureMap(map as unknown as Map)).rejects.toThrow('Canvas 2D')
  })

  it('PNG из холста, а пустой результат — ошибка', async () => {
    const png = new Blob(['png'], { type: 'image/png' })
    const canvas = document.createElement('canvas')
    const toBlob = vi
      .spyOn(canvas, 'toBlob')
      .mockImplementationOnce((done) => done(png))
      .mockImplementationOnce((done) => done(null))

    await expect(toPngBlob(canvas)).resolves.toBe(png)
    await expect(toPngBlob(canvas)).rejects.toThrow('PNG')
    expect(toBlob).toHaveBeenCalledTimes(2)
  })

  it('имя файла PDF — с тем же днём', () => {
    expect(mapFileName(new Date('2026-10-18T12:00:00Z'), 'pdf')).toBe(
      'vitiguard-map-2026-10-18.pdf',
    )
  })

  it('добавляет над кадром полосу с заголовком', () => {
    const context = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as never,
    )
    const frame = source()

    const canvas = withTitle(frame, 'Карта участков')

    // Шрифт 18 px и отступы при плотности 2: полоса 36 + 48 = 84 px
    expect([canvas.width, canvas.height]).toEqual([800, 684])
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 800, 84)
    expect(context.fillText).toHaveBeenCalledWith('Карта участков', 24, 42)
    expect(context.drawImage).toHaveBeenCalledWith(frame, 0, 84)
  })

  it('JPEG из холста в байтах, а пустой результат — ошибка', async () => {
    const canvas = document.createElement('canvas')
    const toBlob = vi
      .spyOn(canvas, 'toBlob')
      .mockImplementationOnce((done) =>
        done(new Blob([new Uint8Array([255, 216])])),
      )
      .mockImplementationOnce((done) => done(null))

    await expect(toJpegBytes(canvas)).resolves.toEqual(
      new Uint8Array([255, 216]),
    )
    await expect(toJpegBytes(canvas)).rejects.toThrow('JPEG')
    expect(toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.92,
    )
  })

  it('сохраняет файл через ссылку и освобождает адрес', () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    const revoke = vi.fn()
    URL.createObjectURL = vi.fn(() => 'blob:map')
    URL.revokeObjectURL = revoke

    saveBlob(new Blob(['png']), 'map.png')

    expect(click).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:map')
  })
})
