import { afterEach, describe, expect, it, vi } from 'vitest'
import { useThemeStore } from '@/theme'
import type { TelegramWebApp } from './telegram'
import {
  applyTelegramTheme,
  telegramPalette,
  watchTelegramTheme,
} from './telegramTheme'

function webApp(
  colorScheme: 'light' | 'dark',
  themeParams: TelegramWebApp['themeParams'],
) {
  return {
    colorScheme,
    themeParams,
    onEvent: vi.fn(),
    offEvent: vi.fn(),
    setHeaderColor: vi.fn(),
    setBackgroundColor: vi.fn(),
  } as unknown as TelegramWebApp
}

const root = document.documentElement
const token = (name: string) => root.style.getPropertyValue(`--${name}`)

afterEach(() => {
  root.removeAttribute('style')
  root.classList.remove('dark')
})

describe('telegramTheme', () => {
  it('берёт цвета темы Telegram, новые параметры — в первую очередь', () => {
    expect(
      telegramPalette({
        bg_color: '#17212b',
        secondary_bg_color: '#0e1621',
        section_bg_color: '#17212b',
        text_color: '#f5f5f5',
        hint_color: '#708499',
        link_color: '#6ab3f3',
        accent_text_color: '#6ab2f2',
        destructive_text_color: '#ec3942',
      }),
    ).toEqual({
      canvas: '#0e1621',
      surface: '#17212b',
      muted: '#0e1621',
      ink: '#f5f5f5',
      'ink-soft': '#f5f5f5',
      'ink-muted': '#708499',
      'ink-subtle': '#708499',
      line: '#0e1621',
      accent: '#6ab2f2',
      danger: '#ec3942',
    })
  })

  it('у старого клиента берёт то, что есть, и пропускает неверные значения', () => {
    expect(
      telegramPalette({
        bg_color: '#ffffff',
        text_color: 'black',
        link_color: '#2481cc',
      }),
    ).toEqual({ canvas: '#ffffff', surface: '#ffffff', accent: '#2481cc' })
  })

  it('«как в системе» — схема и цвета Telegram', () => {
    useThemeStore.setState({ theme: 'system' })
    const app = webApp('dark', { bg_color: '#17212b', text_color: '#f5f5f5' })

    applyTelegramTheme(app)

    expect(root.classList.contains('dark')).toBe(true)
    expect(token('surface')).toBe('#17212b')
    expect(token('ink')).toBe('#f5f5f5')
    expect(app.setHeaderColor).toHaveBeenCalledWith('secondary_bg_color')
    expect(app.setBackgroundColor).toHaveBeenCalledWith('secondary_bg_color')
  })

  it('выбранная вручную тема — палитра приложения', () => {
    useThemeStore.setState({ theme: 'light' })
    root.style.setProperty('--surface', '#17212b')

    applyTelegramTheme(webApp('dark', { bg_color: '#17212b' }))

    expect(root.classList.contains('dark')).toBe(false)
    expect(token('surface')).toBe('')
  })

  it('следит за сменой темы в Telegram и в профиле', () => {
    useThemeStore.setState({ theme: 'system' })
    const app = webApp('light', { bg_color: '#ffffff' })

    const stop = watchTelegramTheme(app)
    expect(token('surface')).toBe('#ffffff')

    const onChange = vi.mocked(app.onEvent).mock.calls[0]?.[1]
    Object.assign(app, {
      colorScheme: 'dark',
      themeParams: { bg_color: '#17212b' },
    })
    onChange?.()
    expect(root.classList.contains('dark')).toBe(true)
    expect(token('surface')).toBe('#17212b')

    useThemeStore.getState().setTheme('light')
    expect(root.classList.contains('dark')).toBe(false)
    expect(token('surface')).toBe('')

    stop()
    expect(app.offEvent).toHaveBeenCalledWith('themeChanged', onChange)
    useThemeStore.getState().setTheme('system')
    expect(token('surface')).toBe('')
  })
})
