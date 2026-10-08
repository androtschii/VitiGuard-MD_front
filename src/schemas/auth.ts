import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Введите email')
    .pipe(z.email('Введите корректный email')),
  // Длину и состав пароля проверяет сервер при регистрации; при входе пароль
  // только обязателен: старый пароль мог быть создан по прежним правилам
  password: z.string().min(1, 'Введите пароль'),
})

export type LoginValues = z.infer<typeof loginSchema>

// Роли, которые пользователь выбирает при регистрации. Роль администратора
// сюда не входит: её назначает только администратор, самому себе её не выдать
export const registrationRoles = [
  { value: 'user', label: 'Виноградарь' },
  { value: 'agronomist', label: 'Агроном' },
] as const

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Введите имя'),
    email: z
      .string()
      .trim()
      .min(1, 'Введите email')
      .pipe(z.email('Введите корректный email')),
    password: z
      .string()
      .min(8, 'Не короче 8 символов')
      .max(128, 'Не длиннее 128 символов')
      .regex(/\p{L}/u, 'Добавьте хотя бы одну букву')
      .regex(/\d/, 'Добавьте хотя бы одну цифру'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
    role: z.enum(['user', 'agronomist']),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type RegisterValues = z.infer<typeof registerSchema>
