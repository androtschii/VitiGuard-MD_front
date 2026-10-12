import { z } from 'zod'

// Сообщения — ключи перевода (validation.*), текст подставляет Field
export const vineyardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'validation.vineyardNameRequired')
    .max(255, 'validation.vineyardNameMax'),
})

export type VineyardValues = z.infer<typeof vineyardSchema>
