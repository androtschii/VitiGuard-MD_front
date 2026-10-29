import * as z from 'zod/mini'

// Те же границы, что у UserUpdate на сервере: от 2 до 255 символов
export const profileSchema = z.object({
  fullName: z
    .string()
    .check(
      z.trim(),
      z.minLength(2, 'validation.nameRequired'),
      z.maxLength(255, 'validation.nameMax'),
    ),
})

export type ProfileValues = z.infer<typeof profileSchema>
