import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('склеивает условные классы', () => {
    const isActive = true
    const isHidden = false

    expect(cn('px-4', isActive && 'font-bold', isHidden && 'hidden')).toBe(
      'px-4 font-bold',
    )
  })

  it('оставляет последний из конфликтующих классов', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
  })
})
