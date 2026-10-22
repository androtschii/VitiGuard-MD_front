import { vi } from 'vitest'
import type { TelegramWebApp } from '@/lib/telegram'

// Мини-приложение Telegram для тестов: все методы SDK — шпионы
export function fakeTelegram(version = '8.0'): TelegramWebApp {
  const button = () => ({
    show: vi.fn(),
    hide: vi.fn(),
    onClick: vi.fn(),
    offClick: vi.fn(),
  })
  return {
    initData: 'query_id=1',
    version,
    platform: 'android',
    colorScheme: 'light',
    themeParams: {},
    onEvent: vi.fn(),
    offEvent: vi.fn(),
    ready: vi.fn(),
    expand: vi.fn(),
    isVersionAtLeast: (wanted) => Number(version) >= Number(wanted),
    disableVerticalSwipes: vi.fn(),
    BackButton: button(),
    MainButton: {
      ...button(),
      setText: vi.fn(),
      showProgress: vi.fn(),
      hideProgress: vi.fn(),
    },
    openTelegramLink: vi.fn(),
    HapticFeedback: { notificationOccurred: vi.fn() },
  }
}
