import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as camera from '@/lib/camera'
import {
  fakeStream,
  fakeTrack,
  removeCamera,
  stubCamera,
} from '@/test/fakeCamera'
import { CameraCapture } from './CameraCapture'

afterEach(() => {
  removeCamera()
  vi.restoreAllMocks()
})

function setup(stream: ReturnType<typeof fakeStream> | DOMException) {
  stubCamera(stream)
  const onClose = vi.fn()
  const onCapture = vi.fn()
  const view = render(
    <CameraCapture open onClose={onClose} onCapture={onCapture} />,
  )
  return { ...view, onClose, onCapture }
}

function playVideo() {
  const video = screen.getByLabelText('Изображение с камеры')
  Object.defineProperty(video, 'videoWidth', { value: 640 })
  return video
}

describe('CameraCapture', () => {
  it('снимает кадр, отдаёт файл и выключает камеру', async () => {
    const stream = fakeStream()
    const { onClose, onCapture, unmount } = setup(stream)
    const photo = new File(['jpeg'], 'leaf-camera.jpg', { type: 'image/jpeg' })
    vi.spyOn(camera, 'captureFrame').mockResolvedValue(photo)
    const take = screen.getByRole('button', { name: 'Снять' })
    await waitFor(() => expect(take).toBeEnabled())
    playVideo()

    await userEvent.click(take)

    expect(onCapture).toHaveBeenCalledWith(photo)
    expect(onClose).toHaveBeenCalled()
    // Без вспышки и зума их кнопок нет
    expect(screen.queryByRole('button', { name: /вспышку/ })).toBeNull()
    expect(screen.queryByRole('slider')).toBeNull()

    unmount()
    expect(stream.track.stop).toHaveBeenCalled()
  })

  it('пока видео не пошло, кадр не снимается', async () => {
    const { onCapture } = setup(fakeStream())
    const take = screen.getByRole('button', { name: 'Снять' })
    await waitFor(() => expect(take).toBeEnabled())

    await userEvent.click(take)

    expect(onCapture).not.toHaveBeenCalled()
  })

  it('вспышка и зум, если камера их умеет', async () => {
    const track = fakeTrack({ torch: true, zoom: { min: 1, max: 5, step: 1 } })
    setup(fakeStream(track))

    const torch = await screen.findByRole('button', {
      name: 'Включить вспышку',
    })
    await userEvent.click(torch)
    expect(
      screen.getByRole('button', { name: 'Выключить вспышку' }),
    ).toHaveAttribute('aria-pressed', 'true')
    fireEvent.change(screen.getByRole('slider', { name: 'Зум' }), {
      target: { value: '3' },
    })

    expect(track.applyConstraints.mock.calls).toEqual([
      [{ advanced: [{ torch: true }] }],
      [{ advanced: [{ zoom: 3 }] }],
    ])
  })

  it('вспышка не включилась — кнопка возвращается', async () => {
    const track = fakeTrack({ torch: true })
    track.applyConstraints.mockRejectedValue(new Error('no torch'))
    setup(fakeStream(track))

    await userEvent.click(
      await screen.findByRole('button', { name: 'Включить вспышку' }),
    )

    expect(
      await screen.findByRole('button', { name: 'Включить вспышку' }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('ошибка зума не мешает снимать', async () => {
    const track = fakeTrack({ zoom: { min: 1, max: 5, step: 1 } })
    track.applyConstraints.mockRejectedValue(new Error('no zoom'))
    setup(fakeStream(track))

    fireEvent.change(await screen.findByRole('slider', { name: 'Зум' }), {
      target: { value: '2' },
    })

    await waitFor(() => expect(track.applyConstraints).toHaveBeenCalled())
    expect(screen.getByRole('slider', { name: 'Зум' })).toHaveValue('2')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('поток без видео — снимать нечем', async () => {
    const empty = { ...fakeStream(), getVideoTracks: () => [] }
    const getUserMedia = stubCamera(empty)
    render(<CameraCapture open onClose={vi.fn()} onCapture={vi.fn()} />)

    await waitFor(() => expect(getUserMedia).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Снять' })).toBeDisabled()
  })

  it('без разрешения на камеру объясняет, что делать', async () => {
    setup(new DOMException('denied', 'NotAllowedError'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Нет доступа к камере',
    )
    expect(screen.getByRole('button', { name: 'Снять' })).toBeDisabled()
  })

  it('кадр не сохранился — сообщает об ошибке', async () => {
    setup(fakeStream())
    vi.spyOn(camera, 'captureFrame').mockRejectedValue(new Error('frame'))
    const take = screen.getByRole('button', { name: 'Снять' })
    await waitFor(() => expect(take).toBeEnabled())
    playVideo()

    await userEvent.click(take)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Камера не запустилась',
    )
  })

  it('камера открылась уже после закрытия окна — сразу выключается', async () => {
    let resolve: (stream: unknown) => void = () => {}
    const stream = fakeStream()
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () =>
          new Promise((done) => {
            resolve = done
          }),
      },
    })
    const { rerender } = render(
      <CameraCapture open onClose={vi.fn()} onCapture={vi.fn()} />,
    )

    rerender(
      <CameraCapture open={false} onClose={vi.fn()} onCapture={vi.fn()} />,
    )
    resolve(stream)

    await waitFor(() => expect(stream.track.stop).toHaveBeenCalled())
  })
})
