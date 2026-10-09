import { z } from 'zod'

// Сообщения — ключи перевода (validation.*): текст на нужном языке подставляет Field

const emailSchema = z
  .string()
  .trim()
  .min(1, 'validation.emailRequired')
  .pipe(z.email('validation.emailInvalid'))

// Правила нового пароля: при регистрации и при сбросе они одни и те же
const newPasswordSchema = z
  .string()
  .min(8, 'validation.passwordMin')
  .max(128, 'validation.passwordMax')
  .regex(/\p{L}/u, 'validation.passwordLetter')
  .regex(/\d/, 'validation.passwordDigit')

const mustMatch = {
  message: 'validation.passwordsMismatch',
  path: ['confirmPassword'],
}

export const loginSchema = z.object({
  email: emailSchema,
  // Длину и состав пароля проверяет сервер при регистрации; при входе пароль
  // только обязателен: старый пароль мог быть создан по прежним правилам
  password: z.string().min(1, 'validation.passwordRequired'),
})

export type LoginValues = z.infer<typeof loginSchema>

// Роли, которые пользователь выбирает при регистрации. Роль администратора
// сюда не входит: её назначает только администратор, самому себе её не выдать
export const registrationRoles = [
  { value: 'user' },
  { value: 'agronomist' },
] as const

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'validation.nameRequired'),
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'validation.confirmRequired'),
    role: z.enum(['user', 'agronomist']),
  })
  .refine((values) => values.password === values.confirmPassword, mustMatch)

export type RegisterValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({ email: emailSchema })

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'validation.confirmRequired'),
  })
  .refine((values) => values.password === values.confirmPassword, mustMatch)

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
