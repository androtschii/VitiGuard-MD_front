import { describe, expect, it } from 'vitest'
import { vineyardSchema } from './vineyard'

describe('vineyardSchema', () => {
  it('убирает пробелы по краям названия', () => {
    expect(vineyardSchema.parse({ name: '  Криково  ' })).toEqual({
      name: 'Криково',
    })
  })

  it.each([
    ['   ', 'validation.vineyardNameRequired'],
    ['x'.repeat(256), 'validation.vineyardNameMax'],
  ])('отклоняет название %#', (name, message) => {
    expect(vineyardSchema.safeParse({ name }).error?.issues[0]?.message).toBe(
      message,
    )
  })
})
