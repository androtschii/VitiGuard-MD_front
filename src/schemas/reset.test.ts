import { describe, expect, it } from 'vitest'
import { forgotPasswordSchema, resetPasswordSchema } from './auth'

describe('forgotPasswordSchema', () => {
  it('обрезает пробелы и принимает корректный email', () => {
    expect(
      forgotPasswordSchema.parse({ email: ' grower@example.md ' }).email,
    ).toBe('grower@example.md')
  })

  it.each([
    ['', 'validation.emailRequired'],
    ['grower', 'validation.emailInvalid'],
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
    [{ password: 'abc1', confirmPassword: 'abc1' }, 'validation.passwordMin'],
    [
      { password: '12345678', confirmPassword: '12345678' },
      'validation.passwordLetter',
    ],
    [
      { password: 'abcdefgh', confirmPassword: 'abcdefgh' },
      'validation.passwordDigit',
    ],
    [
      { password: 'secret123', confirmPassword: 'secret124' },
      'validation.passwordsMismatch',
    ],
  ])('отклоняет %j', (values, message) => {
    expect(
      resetPasswordSchema.safeParse(values).error?.issues[0]?.message,
    ).toBe(message)
  })
})
