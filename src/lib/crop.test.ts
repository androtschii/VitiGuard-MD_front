import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  centeredSquare,
  clampSquare,
  cropPhoto,
  croppedName,
  MAX_CROP_SIDE,
  resizeSquare,
} from './crop'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('crop', () => {
  it('рамка по умолчанию — наибольший квадрат по центру', () => {
    expect(centeredSquare(4000, 3000)).toEqual({ x: 500, y: 0, size: 3000 })
    expect(centeredSquare(600, 800)).toEqual({ x: 0, y: 100, size: 600 })
  })

  it('рамка не выходит за края фото и не меньше пятой части стороны', () => {
    expect(clampSquare({ x: -50, y: 900, size: 500 }, 1000, 1000)).toEqual({
      x: 0,
      y: 500,
      size: 500,
    })
    expect(clampSquare({ x: 0, y: 0, size: 10 }, 1000, 800).size).toBe(160)
    expect(clampSquare({ x: 0, y: 0, size: 5000 }, 1000, 800).size).toBe(800)
  })

  it('размер меняется вокруг центра рамки', () => {
    const square = { x: 400, y: 300, size: 200 }

    expect(resizeSquare(square, 300, 1000, 1000)).toEqual({
      x: 350,
      y: 250,
      size: 300,
    })
    // У края рамка сдвигается внутрь фото
    expect(resizeSquare({ x: 0, y: 0, size: 200 }, 400, 1000, 1000)).toEqual({
      x: 0,
      y: 0,
      size: 400,
    })
  })

  it('имя кадрированной копии', () => {
    expect(croppedName('IMG_2041.HEIC.jpeg')).toBe('IMG_2041.HEIC-crop.jpg')
    expect(croppedName('leaf')).toBe('leaf-crop.jpg')
  })

  it('вырезает квадрат в JPEG, большой — уменьшая до предела', async () => {
    const context = { drawImage: vi.fn() }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as never,
    )
    const toBlob = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(function (this: HTMLCanvasElement, done) {
        done(new Blob([`${this.width}`], { type: 'image/jpeg' }))
      })
    const image = document.createElement('img')

    const file = await cropPhoto(
      image,
      { x: 10, y: 20, size: 3000 },
      'leaf.png',
    )

    expect(file.name).toBe('leaf-crop.jpg')
    expect(file.type).toBe('image/jpeg')
    expect(await file.text()).toBe(String(MAX_CROP_SIDE))
    expect(context.drawImage).toHaveBeenCalledWith(
      image,
      10,
      20,
      3000,
      3000,
      0,
      0,
      MAX_CROP_SIDE,
      MAX_CROP_SIDE,
    )
    expect(toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.92,
    )
  })

  it('без Canvas 2D или пустого результата — ошибка', async () => {
    const image = document.createElement('img')
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    await expect(
      cropPhoto(image, { x: 0, y: 0, size: 10 }, 'a.jpg'),
    ).rejects.toThrow('Canvas 2D')

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as never)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((done) =>
      done(null),
    )
    await expect(
      cropPhoto(image, { x: 0, y: 0, size: 10 }, 'a.jpg'),
    ).rejects.toThrow('кадрировать')
  })
})
