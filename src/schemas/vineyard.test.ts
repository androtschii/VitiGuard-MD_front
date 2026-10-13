import { describe, expect, it } from 'vitest'
import { vineyardSchema } from './vineyard'

describe('vineyardSchema', () => {
  it('убирает пробелы по краям названия', () => {
    expect(
      vineyardSchema.parse({
        name: '  Криково  ',
        varietyId: '',
        plantingYear: ' 2015 ',
      }),
    ).toEqual({ name: 'Криково', varietyId: '', plantingYear: '2015' })
  })

  it.each([
    ['   ', 'validation.vineyardNameRequired'],
    ['x'.repeat(256), 'validation.vineyardNameMax'],
  ])('отклоняет название %#', (name, message) => {
    expect(
      vineyardSchema.safeParse({ name, varietyId: '', plantingYear: '' }).error
        ?.issues[0]?.message,
    ).toBe(message)
  })
})
