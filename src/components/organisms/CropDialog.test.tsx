import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as crop from '@/lib/crop'
import { CropDialog } from './CropDialog'

function renderDialog(onCrop = vi.fn(), onClose = vi.fn()) {
  render(
    <CropDialog
      open
      photoUrl="blob:leaf-photo"
      fileName="leaf.jpg"
      onClose={onClose}
      onCrop={onCrop}
    />,
  )
  // Фото 1000 × 500: рамка по умолчанию — квадрат 500 по центру
  const image = screen.getByRole('img')
  Object.defineProperty(image, 'naturalWidth', { value: 1000 })
  Object.defineProperty(image, 'naturalHeight', { value: 500 })
  fireEvent.load(image)
  return {
    onCrop,
    onClose,
    frame: screen.getByRole('button', { name: /Рамка/ }),
  }
}

describe('CropDialog', () => {
  it('рамка по умолчанию — наибольший квадрат по центру фото', () => {
    const { frame } = renderDialog()

    expect(frame.style.left).toBe('25%')
    expect(frame.style.top).toBe('0%')
    expect(frame.style.width).toBe('50%')
    expect(frame.style.height).toBe('100%')
    expect(screen.getByRole('slider', { name: 'Размер рамки' })).toHaveValue(
      '100',
    )
  })

  it('стрелки двигают рамку, но не за край фото', () => {
    const { frame } = renderDialog()

    fireEvent.keyDown(frame, { key: 'ArrowLeft' })
    expect(frame.style.left).toBe('24%')
    fireEvent.keyDown(frame, { key: 'ArrowUp' })
    expect(frame.style.top).toBe('0%')
  })

  it('слайдер уменьшает рамку вокруг центра', () => {
    const { frame } = renderDialog()

    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })

    expect(frame.style.width).toBe('25%')
    expect(frame.style.left).toBe('37.5%')
    expect(frame.style.top).toBe('25%')
  })

  it('рамку можно перетащить', () => {
    const { frame } = renderDialog()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })

    fireEvent.pointerDown(frame, { pointerId: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 200, clientY: 50 })
    fireEvent.pointerUp(frame, { pointerId: 1 })
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 400, clientY: 400 })

    expect(frame.style.left).toBe('47.5%')
    expect(frame.style.top).toBe('15%')
  })

  it('отдаёт кадрированную копию', async () => {
    const file = new File(['jpeg'], 'leaf-crop.jpg', { type: 'image/jpeg' })
    const cropPhoto = vi.spyOn(crop, 'cropPhoto').mockResolvedValue(file)
    const { onCrop } = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Кадрировать' }))

    expect(cropPhoto).toHaveBeenCalledWith(
      screen.getByRole('img'),
      { x: 250, y: 0, size: 500 },
      'leaf.jpg',
    )
    expect(onCrop).toHaveBeenCalledWith(file)
  })

  it('сообщает, если кадрировать не удалось', async () => {
    vi.spyOn(crop, 'cropPhoto').mockRejectedValue(new Error('canvas'))
    const { onCrop } = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Кадрировать' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось кадрировать',
    )
    expect(onCrop).not.toHaveBeenCalled()
  })

  it('«Отмена» закрывает окно', async () => {
    const { onClose } = renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Отмена' }))

    expect(onClose).toHaveBeenCalled()
  })
})
