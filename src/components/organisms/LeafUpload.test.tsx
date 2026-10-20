import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import * as camera from '@/lib/camera'
import * as crop from '@/lib/crop'
import { fakeStream, removeCamera, stubCamera } from '@/test/fakeCamera'
import { LeafUpload } from './LeafUpload'

const leaf = new File(['leaf'], 'leaf.jpg', { type: 'image/jpeg' })

function setup(file: File | null = null) {
  const onSelect = vi.fn<(file: File) => void>()
  const view = render(<LeafUpload file={file} onSelect={onSelect} />)
  return {
    ...view,
    onSelect,
    input: screen.getByLabelText('Выбрать фото листа'),
    // Проверку формата делает компонент, а не фильтр диалога выбора файла
    user: userEvent.setup({ applyAccept: false }),
  }
}

function dropZone() {
  const zone = screen.getByText('выберите файл').closest('label')
  if (!zone) throw new Error('нет области загрузки')
  return zone
}

describe('LeafUpload', () => {
  it('кадрирование — только для выбранного фото и только если его ждут', () => {
    setup(leaf)
    expect(
      screen.queryByRole('button', { name: 'Кадрировать' }),
    ).not.toBeInTheDocument()
  })

  it('открывает кадрирование и передаёт кадрированную копию', async () => {
    const cropped = new File(['jpeg'], 'leaf-crop.jpg', { type: 'image/jpeg' })
    vi.spyOn(crop, 'cropPhoto').mockResolvedValue(cropped)
    const onCrop = vi.fn<(file: File) => void>()
    render(<LeafUpload file={leaf} onSelect={vi.fn()} onCrop={onCrop} />)

    await userEvent.click(screen.getByRole('button', { name: 'Кадрировать' }))
    const dialog = screen.getByRole('dialog', { name: 'Кадрирование фото' })
    const image = within(dialog).getByRole('img')
    Object.defineProperty(image, 'naturalWidth', { value: 800 })
    Object.defineProperty(image, 'naturalHeight', { value: 600 })
    fireEvent.load(image)
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Кадрировать' }),
    )

    expect(onCrop).toHaveBeenCalledWith(cropped)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('«Отмена» закрывает кадрирование без изменений', async () => {
    const onCrop = vi.fn<(file: File) => void>()
    render(<LeafUpload file={leaf} onSelect={vi.fn()} onCrop={onCrop} />)

    await userEvent.click(screen.getByRole('button', { name: 'Кадрировать' }))
    await userEvent.click(screen.getByRole('button', { name: 'Отмена' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onCrop).not.toHaveBeenCalled()
  })

  it('предлагает перетащить или выбрать фото', () => {
    const { input } = setup()

    expect(screen.getByText('выберите файл')).toBeInTheDocument()
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(input).toHaveAccessibleDescription('JPEG, PNG или WebP до 10 МБ')
  })

  it('кнопка камеры открывает съёмку и передаёт снимок', async () => {
    const { onSelect, user } = setup()
    const camera = screen.getByLabelText('Сфотографировать лист')

    expect(camera).toHaveAttribute('capture', 'environment')
    await user.upload(camera, leaf)

    expect(onSelect).toHaveBeenCalledWith(leaf)
  })

  it('если браузер даёт камеру, снимает в приложении', async () => {
    stubCamera(fakeStream())
    const { onSelect } = setup()
    const photo = new File(['jpeg'], 'leaf-camera.jpg', { type: 'image/jpeg' })
    vi.spyOn(camera, 'captureFrame').mockResolvedValue(photo)

    await userEvent.click(
      screen.getByRole('button', { name: 'Сфотографировать лист' }),
    )
    const take = await screen.findByRole('button', { name: 'Снять' })
    await waitFor(() => expect(take).toBeEnabled())
    Object.defineProperty(
      screen.getByLabelText('Изображение с камеры'),
      'videoWidth',
      {
        value: 640,
      },
    )
    await userEvent.click(take)

    expect(onSelect).toHaveBeenCalledWith(photo)
    removeCamera()
  })

  it('передаёт выбранное фото', async () => {
    const { input, onSelect, user } = setup()

    await user.upload(input, leaf)

    expect(onSelect).toHaveBeenCalledWith(leaf)
    expect(input).toHaveValue('')
  })

  it('не принимает файл другого формата и объясняет почему', async () => {
    const { input, onSelect, user } = setup()
    const scan = new File(['%PDF'], 'scan.pdf', { type: 'application/pdf' })

    await user.upload(input, scan)

    expect(onSelect).not.toHaveBeenCalled()
    expect(
      screen.getByText('Нужна фотография в формате JPEG, PNG или WebP'),
    ).toBeInTheDocument()
  })

  it('не принимает файл больше 10 МБ', async () => {
    const { input, onSelect, user } = setup()
    const huge = new File(['x'], 'huge.jpg', { type: 'image/jpeg' })
    Object.defineProperty(huge, 'size', { value: 11 * 1024 * 1024 })

    await user.upload(input, huge)

    expect(onSelect).not.toHaveBeenCalled()
    expect(screen.getByText('Файл больше 10 МБ')).toBeInTheDocument()
  })

  it('принимает фото, перетащенное мышью', () => {
    const { onSelect } = setup()

    fireEvent.dragOver(dropZone())
    expect(dropZone()).toHaveClass('bg-accent-soft')
    fireEvent.dragLeave(dropZone())
    expect(dropZone()).not.toHaveClass('bg-accent-soft')
    fireEvent.drop(dropZone(), { dataTransfer: { files: [leaf] } })

    expect(onSelect).toHaveBeenCalledWith(leaf)
  })

  it('пустое перетаскивание ничего не выбирает', () => {
    const { onSelect } = setup()

    fireEvent.drop(dropZone(), { dataTransfer: { files: [] } })

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('показывает предпросмотр и освобождает ссылку на файл', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL')
    const { unmount } = setup(leaf)

    expect(
      screen.getByRole('img', { name: 'Выбранное фото листа' }),
    ).toHaveAttribute('src', 'blob:leaf-photo')
    expect(screen.getByText('Выбрать другое фото')).toBeInTheDocument()
    unmount()
    expect(revoke).toHaveBeenCalledWith('blob:leaf-photo')
  })
})
