import { describe, expect, it } from 'vitest'
import { forgotPasswordSchema, resetPasswordSchema } from './auth'

describe('forgotPasswordSchema', () => {
  it('обрезает пробелы и принимает корректный email', () => {
    expect(
      forgotPasswordSchema.parse({ email: ' grower@example.md ' }).email,
    ).toBe('grower@example.md')
  })

  it.each([
    ['', 'Введите email'],
    ['grower', 'Введите корректный email'],
  ])('отклоняет email %j', (email, message) => {
    expect(
      forgotPasswordSchema.safeParse({ email }).error?.issues[0]?.message,
    ).toBe(message)
  })
})

describe('resetPasswordSchema', () => {
  it('принимает пароль, удовлетворяющий правилам регистрации', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'secret123',
        confirmPassword: 'secret123',
      }).success,
    ).toBe(true)
  })

  it.each([
    [{ password: 'abc1', confirmPassword: 'abc1' }, 'Не короче 8 символов'],
    [
      { password: '12345678', confirmPassword: '12345678' },
      'Добавьте хотя бы одну букву',
    ],
    [
      { password: 'abcdefgh', confirmPassword: 'abcdefgh' },
      'Добавьте хотя бы одну цифру',
    ],
    [
      { password: 'secret123', confirmPassword: 'secret124' },
      'Пароли не совпадают',
    ],
  ])('отклоняет %j', (values, message) => {
    expect(
      resetPasswordSchema.safeParse(values).error?.issues[0]?.message,
    ).toBe(message)
  })
})
