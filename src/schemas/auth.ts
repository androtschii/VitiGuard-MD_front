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
