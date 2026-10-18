import { z } from 'zod'

// Те же границы, что у UserUpdate на сервере: от 2 до 255 символов
export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'validation.nameRequired')
    .max(255, 'validation.nameMax'),
})

export type ProfileValues = z.infer<typeof profileSchema>
