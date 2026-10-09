import { describe, expect, it } from 'vitest'
import { loginSchema } from './auth'

describe('loginSchema', () => {
  it('принимает корректные данные и обрезает пробелы в email', () => {
    const result = loginSchema.parse({
      email: '  grower@example.md ',
      password: 'secret',
    })

    expect(result).toEqual({ email: 'grower@example.md', password: 'secret' })
  })

  it.each([
    ['', 'validation.emailRequired'],
    ['   ', 'validation.emailRequired'],
    ['grower', 'validation.emailInvalid'],
    ['grower@', 'validation.emailInvalid'],
  ])('отклоняет email %j', (email, message) => {
    const result = loginSchema.safeParse({ email, password: 'secret' })

    expect(result.error?.issues[0]?.message).toBe(message)
  })

  it('требует пароль, но не проверяет его длину', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.md', password: '' }).error?.issues[0]
        ?.message,
    ).toBe('validation.passwordRequired')
    expect(
      loginSchema.safeParse({ email: 'a@b.md', password: '1' }).success,
    ).toBe(true)
  })
})
