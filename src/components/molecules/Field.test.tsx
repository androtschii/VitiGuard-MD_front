import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/atoms/Input'
import { Field } from './Field'

describe('Field', () => {
  it('связывает подпись с полем', () => {
    render(<Field label="Email">{(control) => <Input {...control} />}</Field>)

    expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement)
  })

  it('описывает поле подсказкой и ошибкой', () => {
    render(
      <Field
        label="Пароль"
        hint="Не короче 8 символов"
        error="Слишком короткий"
      >
        {(control) => <Input type="password" {...control} />}
      </Field>,
    )
    const input = screen.getByLabelText('Пароль')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(
      'Не короче 8 символов Слишком короткий',
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Слишком короткий')
  })

  it('без ошибки поле не помечено как неверное', () => {
    render(<Field label="Имя">{(control) => <Input {...control} />}</Field>)
    const input = screen.getByLabelText('Имя')

    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('отмечает обязательное поле звёздочкой, скрытой от дикторов', () => {
    render(
      <Field label="Email" required>
        {(control) => <Input required {...control} />}
      </Field>,
    )

    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeRequired()
  })
})
