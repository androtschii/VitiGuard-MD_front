import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fakeTrack,
  removeCamera,
  stubCamera,
  fakeStream,
} from '@/test/fakeCamera'
import {
  cameraFeatures,
  cameraProblem,
  canUseCamera,
  captureFrame,
  openCamera,
  setTorch,
  setZoom,
} from './camera'

afterEach(() => {
  removeCamera()
  vi.restoreAllMocks()
})

function asTrack(track: ReturnType<typeof fakeTrack>) {
  return track as unknown as MediaStreamTrack
}

describe('camera', () => {
  it('читает вспышку и зум из возможностей камеры', () => {
    expect(
      cameraFeatures(
        asTrack(
          fakeTrack({ torch: true, zoom: { min: 1, max: 8, step: 0.5 } }),
        ),
      ),
    ).toEqual({ torch: true, zoom: { min: 1, max: 8, step: 0.5 } })
    // Зум без шага и без диапазона, камера без возможностей
    expect(
      cameraFeatures(asTrack(fakeTrack({ zoom: { min: 1, max: 4 } }))).zoom,
    ).toEqual({ min: 1, max: 4, step: 0.1 })
    expect(
      cameraFeatures(asTrack(fakeTrack({ zoom: { min: 1, max: 1 } }))),
    ).toEqual({ torch: false, zoom: null })
    expect(cameraFeatures({} as MediaStreamTrack)).toEqual({
      torch: false,
      zoom: null,
    })
  })

  it('включает вспышку и зум через ограничения дорожки', async () => {
    const track = fakeTrack()

    await setTorch(asTrack(track), true)
    await setZoom(asTrack(track), 2.5)

    expect(track.applyConstraints.mock.calls).toEqual([
      [{ advanced: [{ torch: true }] }],
      [{ advanced: [{ zoom: 2.5 }] }],
    ])
  })

  it('открывает заднюю камеру, если браузер её даёт', async () => {
    expect(canUseCamera()).toBe(false)
    const stream = fakeStream()
    const getUserMedia = stubCamera(stream)

    expect(canUseCamera()).toBe(true)
    await expect(openCamera()).resolves.toBe(stream)
    expect(getUserMedia.mock.lastCall?.[0]).toMatchObject({
      audio: false,
      video: { facingMode: { ideal: 'environment' } },
    })
  })

  it('понятная причина, почему камера не открылась', () => {
    expect(cameraProblem(new DOMException('', 'NotAllowedError'))).toBe(
      'denied',
    )
    expect(cameraProblem(new DOMException('', 'SecurityError'))).toBe('denied')
    expect(cameraProblem(new DOMException('', 'NotFoundError'))).toBe('missing')
    expect(cameraProblem(new DOMException('', 'OverconstrainedError'))).toBe(
      'missing',
    )
    expect(cameraProblem(new Error('boom'))).toBe('failed')
  })

  it('сохраняет кадр видео в JPEG', async () => {
    const drawImage = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as never)
    const toBlob = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementationOnce((done) => done(new Blob(['jpeg'])))
      .mockImplementationOnce((done) => done(null))
    const video = document.createElement('video')
    Object.defineProperty(video, 'videoWidth', { value: 640 })
    Object.defineProperty(video, 'videoHeight', { value: 480 })

    const file = await captureFrame(video)

    expect(file.name).toBe('leaf-camera.jpg')
    expect(file.type).toBe('image/jpeg')
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0)
    expect(toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.92,
    )
    await expect(captureFrame(video)).rejects.toThrow('frame')
  })
})
