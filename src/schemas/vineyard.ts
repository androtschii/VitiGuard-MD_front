import * as z from 'zod/mini'

// Сообщения — ключи перевода (validation.*), текст подставляет Field
export const vineyardSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, 'validation.vineyardNameRequired'),
      z.maxLength(255, 'validation.vineyardNameMax'),
    ),
  // '' — сорт не указан
  varietyId: z.string(),
  // '' — год не указан; иначе от 1900 до текущего года, как проверяет бэкенд
  plantingYear: z.string().check(
    z.trim(),
    z.refine((value) => {
      if (value === '') return true
      const year = Number(value)
      return (
        /^\d{4}$/.test(value) &&
        year >= 1900 &&
        year <= new Date().getFullYear()
      )
    }, 'validation.plantingYear'),
  ),
})

export type VineyardValues = z.infer<typeof vineyardSchema>
