import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { VineyardForm } from './VineyardForm'

function renderForm(props: Partial<Parameters<typeof VineyardForm>[0]> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  render(
    <VineyardForm
      areaHa={2.345}
      submitLabel="Сохранить участок"
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  )
  return { onSubmit, onCancel }
}

const submit = () =>
  userEvent.click(screen.getByRole('button', { name: 'Сохранить участок' }))

describe('VineyardForm', () => {
  it('показывает площадь контура', () => {
    renderForm()

    expect(screen.getByText('Площадь: 2,35 га')).toBeInTheDocument()
  })

  it('без названия не отправляется', async () => {
    const { onSubmit } = renderForm()

    await submit()

    expect(
      await screen.findByText('Введите название участка'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('отправляет название без лишних пробелов', async () => {
    const { onSubmit } = renderForm()

    await userEvent.type(
      screen.getByLabelText(/Название участка/),
      '  Криково, северный склон  ',
    )
    await submit()

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Криково, северный склон' })
  })

  it('при правке подставляет текущее название', () => {
    renderForm({ defaultValues: { name: 'Криково' } })

    expect(screen.getByLabelText(/Название участка/)).toHaveValue('Криково')
  })

  it.each([
    [
      new ApiError('Контур пересекает сам себя', 422),
      'Контур пересекает сам себя',
    ],
    [new Error('boom'), 'Не удалось сохранить участок'],
  ])('показывает ошибку сохранения: %s', async (error, message) => {
    renderForm({
      defaultValues: { name: 'Криково' },
      onSubmit: vi.fn().mockRejectedValue(error),
    })

    await submit()

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
  })

  it('кнопка удаления убирает контур', async () => {
    const { onCancel } = renderForm()

    await userEvent.click(
      screen.getByRole('button', { name: 'Удалить контур' }),
    )

    expect(onCancel).toHaveBeenCalledOnce()
  })
})
