import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

function renderModal(open: boolean, onClose = vi.fn()) {
  const view = render(
    <Modal
      open={open}
      onClose={onClose}
      title="Удалить участок?"
      description="Действие нельзя отменить"
      footer={<button>Удалить</button>}
    >
      Текст
    </Modal>,
  )
  return { ...view, onClose }
}

describe('Modal', () => {
  it('открывается и подписан заголовком и описанием', () => {
    renderModal(true)
    const dialog = screen.getByRole('dialog', { name: 'Удалить участок?' })

    expect(dialog).toHaveAttribute('open')
    expect(dialog).toHaveAccessibleDescription('Действие нельзя отменить')
  })

  it('закрытое окно не показывается', () => {
    renderModal(false)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('закрывается при смене open', () => {
    const { rerender, onClose } = renderModal(true)

    rerender(
      <Modal open={false} onClose={onClose} title="Удалить участок?">
        Текст
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('кнопка «Закрыть» вызывает onClose', () => {
    const { onClose } = renderModal(true)

    fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('клик по фону закрывает, клик по содержимому — нет', () => {
    const { onClose } = renderModal(true)
    const dialog = screen.getByRole('dialog')

    fireEvent.click(screen.getByText('Текст'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledOnce()
  })
})
