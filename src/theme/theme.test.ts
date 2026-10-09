import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  THEME_STORAGE_KEY,
  applyTheme,
  readStoredTheme,
  useThemeStore,
  watchSystemTheme,
} from '@/theme'

function mockSystemTheme(dark: boolean) {
  const listeners = new Set<() => void>()
  const query = {
    matches: dark,
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  }
  vi.stubGlobal('matchMedia', () => query)
  return {
    change(next: boolean) {
      query.matches = next
      listeners.forEach((listener) => listener())
    },
    listeners,
  }
}

const isDark = () => document.documentElement.classList.contains('dark')

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('тема', () => {
  it('по умолчанию следует за системой', () => {
    expect(readStoredTheme()).toBe('system')
  })

  it('игнорирует неизвестное значение в хранилище', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia')

    expect(readStoredTheme()).toBe('system')
  })

  it('без доступа к хранилищу следует за системой', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    expect(readStoredTheme()).toBe('system')
  })

  it('выбор применяется, даже если сохранить его нельзя', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    useThemeStore.getState().setTheme('dark')

    expect(isDark()).toBe(true)
  })

  it('в режиме системы берёт тёмную тему из настроек ОС', () => {
    mockSystemTheme(true)

    applyTheme('system')

    expect(isDark()).toBe(true)
  })

  it('явный выбор важнее настроек ОС', () => {
    mockSystemTheme(true)

    applyTheme('light')

    expect(isDark()).toBe(false)
  })

  it('без matchMedia считает систему светлой', () => {
    vi.stubGlobal('matchMedia', undefined)

    applyTheme('system')

    expect(isDark()).toBe(false)
  })

  it('сохраняет выбор и применяет его', () => {
    useThemeStore.getState().setTheme('dark')

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(readStoredTheme()).toBe('dark')
    expect(isDark()).toBe(true)
  })

  it('переключается вместе с ОС, только пока выбран режим системы', () => {
    const system = mockSystemTheme(false)
    const stop = watchSystemTheme()

    system.change(true)
    expect(isDark()).toBe(true)

    useThemeStore.getState().setTheme('light')
    system.change(true)
    expect(isDark()).toBe(false)

    stop()
    expect(system.listeners.size).toBe(0)
  })

  it('без matchMedia подписка ничего не делает', () => {
    vi.stubGlobal('matchMedia', undefined)

    expect(() => watchSystemTheme()()).not.toThrow()
  })
})
