import { describe, expect, it } from 'vitest'
import { checkLeafPhoto, LEAF_PHOTO_MAX_BYTES } from './leafPhoto'

function file(type: string, size = 1000) {
  const photo = new File(['x'], 'leaf', { type })
  Object.defineProperty(photo, 'size', { value: size })
  return photo
}

describe('checkLeafPhoto', () => {
  it('пропускает JPEG, PNG и WebP', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(checkLeafPhoto(file(type))).toBeNull()
    }
  })

  it('отклоняет другие форматы', () => {
    expect(checkLeafPhoto(file('image/gif'))).toBe('wrongType')
    expect(checkLeafPhoto(file('application/pdf'))).toBe('wrongType')
  })

  it('отклоняет файл больше 10 МБ', () => {
    expect(checkLeafPhoto(file('image/jpeg', LEAF_PHOTO_MAX_BYTES))).toBeNull()
    expect(checkLeafPhoto(file('image/jpeg', LEAF_PHOTO_MAX_BYTES + 1))).toBe(
      'tooLarge',
    )
  })
})
