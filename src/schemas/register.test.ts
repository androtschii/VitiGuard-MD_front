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
    [{ fullName: 'А' }, 'Введите имя'],
    [{ email: 'grower' }, 'Введите корректный email'],
    [{ password: 'abc1', confirmPassword: 'abc1' }, 'Не короче 8 символов'],
    [
      { password: '12345678', confirmPassword: '12345678' },
      'Добавьте хотя бы одну букву',
    ],
    [
      { password: 'abcdefgh', confirmPassword: 'abcdefgh' },
      'Добавьте хотя бы одну цифру',
    ],
    [{ confirmPassword: 'secret124' }, 'Пароли не совпадают'],
    [{ confirmPassword: '' }, 'Повторите пароль'],
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
