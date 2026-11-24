import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useDocumentTitle } from './useDocumentTitle'

describe('useDocumentTitle', () => {
  const originalTitle = document.title

  afterEach(() => {
    document.title = originalTitle
  })

  it('ставит заголовок с суффиксом VitiGuard MD', () => {
    renderHook(() => useDocumentTitle('Карта виноградников'))

    expect(document.title).toBe('Карта виноградников — VitiGuard MD')
  })

  it('без аргумента или для главной ставит просто VitiGuard MD', () => {
    renderHook(() => useDocumentTitle())

    expect(document.title).toBe('VitiGuard MD')
  })

  it('для пустого заголовка ставит VitiGuard MD', () => {
    renderHook(() => useDocumentTitle('   '))

    expect(document.title).toBe('VitiGuard MD')
  })

  it('не дублирует суффикс, если заголовок уже VitiGuard MD', () => {
    renderHook(() => useDocumentTitle('VitiGuard MD'))

    expect(document.title).toBe('VitiGuard MD')
  })

  it('обновляет заголовок при смене переданного значения', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Вход' },
    })

    expect(document.title).toBe('Вход — VitiGuard MD')

    rerender({ title: 'Регистрация' })
    expect(document.title).toBe('Регистрация — VitiGuard MD')

    rerender({ title: '' })
    expect(document.title).toBe('VitiGuard MD')
  })
})
