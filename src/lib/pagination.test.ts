import { describe, expect, it } from 'vitest'
import { getPageItems } from './pagination'

describe('getPageItems', () => {
  it('показывает все страницы, если их мало', () => {
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('сворачивает пропуск после первых страниц', () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, 'ellipsis', 10])
  })

  it('сворачивает пропуски с обеих сторон текущей страницы', () => {
    expect(getPageItems(5, 10)).toEqual([
      1,
      'ellipsis',
      4,
      5,
      6,
      'ellipsis',
      10,
    ])
  })

  it('вместо многоточия на одну страницу показывает саму страницу', () => {
    expect(getPageItems(4, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10])
  })

  it('сворачивает пропуск перед последними страницами', () => {
    expect(getPageItems(10, 10)).toEqual([1, 'ellipsis', 9, 10])
  })

  it('одна страница — один номер', () => {
    expect(getPageItems(1, 1)).toEqual([1])
  })
})
