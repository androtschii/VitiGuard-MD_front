import { z } from 'zod'

// Сообщения — ключи перевода (validation.*), текст подставляет Field
export const vineyardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'validation.vineyardNameRequired')
    .max(255, 'validation.vineyardNameMax'),
  // '' — сорт не указан
  varietyId: z.string(),
  // '' — год не указан; иначе от 1900 до текущего года, как проверяет бэкенд
  plantingYear: z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true
      const year = Number(value)
      return (
        /^\d{4}$/.test(value) &&
        year >= 1900 &&
        year <= new Date().getFullYear()
      )
    }, 'validation.plantingYear'),
})

export type VineyardValues = z.infer<typeof vineyardSchema>
