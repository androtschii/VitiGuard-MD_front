import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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
  it('предлагает перетащить или выбрать фото', () => {
    const { input } = setup()

    expect(screen.getByText('выберите файл')).toBeInTheDocument()
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(input).toHaveAccessibleDescription('JPEG, PNG или WebP до 10 МБ')
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
