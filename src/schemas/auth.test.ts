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
    ['', 'Введите email'],
    ['   ', 'Введите email'],
    ['grower', 'Введите корректный email'],
    ['grower@', 'Введите корректный email'],
  ])('отклоняет email %j', (email, message) => {
    const result = loginSchema.safeParse({ email, password: 'secret' })

    expect(result.error?.issues[0]?.message).toBe(message)
  })

  it('требует пароль, но не проверяет его длину', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.md', password: '' }).error?.issues[0]
        ?.message,
    ).toBe('Введите пароль')
    expect(
      loginSchema.safeParse({ email: 'a@b.md', password: '1' }).success,
    ).toBe(true)
  })
})
