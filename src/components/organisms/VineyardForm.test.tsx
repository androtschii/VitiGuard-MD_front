import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { renderWithQueryClient } from '@/test/render'
import { VineyardForm } from './VineyardForm'

function renderForm(props: Partial<Parameters<typeof VineyardForm>[0]> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onCancel = vi.fn()
  renderWithQueryClient(
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

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Криково, северный склон',
      varietyId: '',
      plantingYear: '',
    })
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

  it('передаёт выбранный сорт и год посадки', async () => {
    const { onSubmit } = renderForm({ defaultValues: { name: 'Криково' } })

    await userEvent.selectOptions(
      await screen.findByLabelText('Сорт'),
      await screen.findByRole('option', { name: 'Merlot' }),
    )
    await userEvent.type(screen.getByLabelText('Год посадки'), '2015')
    await submit()

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Криково',
      varietyId: 'merlot',
      plantingYear: '2015',
    })
  })

  it.each(['1899', '2999', '15'])('отклоняет год посадки %s', async (year) => {
    const { onSubmit } = renderForm({ defaultValues: { name: 'Криково' } })

    await userEvent.type(screen.getByLabelText('Год посадки'), year)
    await submit()

    expect(
      await screen.findByText('Год посадки — от 1900 до текущего'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
