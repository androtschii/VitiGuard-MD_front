// Те же ограничения, что проверяет сервер (backend/pr-040): проверка на клиенте
// не заменяет серверную, но избавляет от отправки заведомо неподходящего файла
export const LEAF_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const LEAF_PHOTO_MAX_BYTES = 10 * 1024 * 1024

export type LeafPhotoProblem = 'wrongType' | 'tooLarge'

export function checkLeafPhoto(file: File): LeafPhotoProblem | null {
  if (!LEAF_PHOTO_TYPES.includes(file.type)) return 'wrongType'
  if (file.size > LEAF_PHOTO_MAX_BYTES) return 'tooLarge'
  return null
}
