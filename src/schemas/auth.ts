// zod/mini — то же ядро проверки, что у zod, но функциями, которые сборка
// выбрасывает, если они не нужны: схемы форм входа весят килобайты, а не 33 КБ
// (pr-098)
import * as z from 'zod/mini'

// Сообщения — ключи перевода (validation.*): текст на нужном языке подставляет Field

const emailSchema = z.pipe(
  z.string().check(z.trim(), z.minLength(1, 'validation.emailRequired')),
  z.email('validation.emailInvalid'),
)

// Правила нового пароля: при регистрации и при сбросе они одни и те же
const newPasswordSchema = z
  .string()
  .check(
    z.minLength(8, 'validation.passwordMin'),
    z.maxLength(128, 'validation.passwordMax'),
    z.regex(/\p{L}/u, 'validation.passwordLetter'),
    z.regex(/\d/, 'validation.passwordDigit'),
  )

const passwordsMatch = z.refine<{ password: string; confirmPassword: string }>(
  (values) => values.password === values.confirmPassword,
  { message: 'validation.passwordsMismatch', path: ['confirmPassword'] },
)

export const loginSchema = z.object({
  email: emailSchema,
  // Длину и состав пароля проверяет сервер при регистрации; при входе пароль
  // только обязателен: старый пароль мог быть создан по прежним правилам
  password: z.string().check(z.minLength(1, 'validation.passwordRequired')),
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
    fullName: z
      .string()
      .check(z.trim(), z.minLength(2, 'validation.nameRequired')),
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z
      .string()
      .check(z.minLength(1, 'validation.confirmRequired')),
    role: z.enum(['user', 'agronomist']),
  })
  .check(passwordsMatch)

export type RegisterValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({ email: emailSchema })

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z
      .string()
      .check(z.minLength(1, 'validation.confirmRequired')),
  })
  .check(passwordsMatch)

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
