import { describe, expect, it } from 'vitest'
import { registerSchema } from './auth'

const valid = {
  fullName: 'Андрей Бахов',
  email: 'grower@example.md',
  password: 'secret123',
  confirmPassword: 'secret123',
  role: 'user',
}

function firstMessage(overrides: Record<string, unknown>) {
  return registerSchema.safeParse({ ...valid, ...overrides }).error?.issues[0]
    ?.message
}

describe('registerSchema', () => {
  it('принимает корректные данные', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('обрезает пробелы в имени и email', () => {
    const result = registerSchema.parse({
      ...valid,
      fullName: '  Андрей  ',
      email: ' grower@example.md ',
    })

    expect(result.fullName).toBe('Андрей')
    expect(result.email).toBe('grower@example.md')
  })

  it.each([
    [{ fullName: 'А' }, 'validation.nameRequired'],
    [{ email: 'grower' }, 'validation.emailInvalid'],
    [{ password: 'abc1', confirmPassword: 'abc1' }, 'validation.passwordMin'],
    [
      { password: '12345678', confirmPassword: '12345678' },
      'validation.passwordLetter',
    ],
    [
      { password: 'abcdefgh', confirmPassword: 'abcdefgh' },
      'validation.passwordDigit',
    ],
    [{ confirmPassword: 'secret124' }, 'validation.passwordsMismatch'],
    [{ confirmPassword: '' }, 'validation.confirmRequired'],
  ])('отклоняет %j', (overrides, message) => {
    expect(firstMessage(overrides)).toBe(message)
  })

  it('принимает буквы любого алфавита', () => {
    const password = 'Пароль123'

    expect(
      registerSchema.safeParse({
        ...valid,
        password,
        confirmPassword: password,
      }).success,
    ).toBe(true)
  })

  it('роль администратора выбрать нельзя', () => {
    expect(registerSchema.safeParse({ ...valid, role: 'admin' }).success).toBe(
      false,
    )
    expect(
      registerSchema.safeParse({ ...valid, role: 'agronomist' }).success,
    ).toBe(true)
  })
})
