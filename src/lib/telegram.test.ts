import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeTelegram } from '@/test/telegram'

const fakeWebApp = fakeTelegram

// Модуль хранит загрузку SDK: каждый тест начинает с чистого
async function load() {
  vi.resetModules()
  return import('./telegram')
}

function sdkScript() {
  return document.head.querySelector<HTMLScriptElement>(
    'script[src="https://telegram.org/js/telegram-web-app.js"]',
  )
}

beforeEach(() => {
  sessionStorage.clear()
  window.location.hash = ''
})

afterEach(() => {
  sdkScript()?.remove()
  Reflect.deleteProperty(window, 'Telegram')
  delete document.documentElement.dataset.telegram
})

describe('telegram', () => {
  it('узнаёт запуск из Telegram по адресу и помнит его после перезагрузки', async () => {
    const { isTelegramLaunch } = await load()

    expect(isTelegramLaunch('')).toBe(false)
    expect(
      isTelegramLaunch('#tgWebAppData=query_id%3D1&tgWebAppVersion=8.0'),
    ).toBe(true)
    expect(isTelegramLaunch('')).toBe(true)
  })

  it('в браузере SDK не загружается', async () => {
    const { initTelegram } = await load()

    expect(await initTelegram()).toBeNull()
    expect(sdkScript()).toBeNull()
  })

  it('в Telegram загружает SDK и разворачивает приложение', async () => {
    window.location.hash = '#tgWebAppPlatform=android'
    const { initTelegram, useTelegramStore } = await load()
    const webApp = fakeWebApp()

    const starting = initTelegram()
    window.Telegram = { WebApp: webApp }
    sdkScript()?.dispatchEvent(new Event('load'))

    expect(await starting).toBe(webApp)
    expect(webApp.ready).toHaveBeenCalled()
    expect(webApp.expand).toHaveBeenCalled()
    expect(webApp.disableVerticalSwipes).toHaveBeenCalled()
    expect(document.documentElement.dataset.telegram).toBe('android')
    expect(useTelegramStore.getState().webApp).toBe(webApp)
  })

  it('в старом Telegram свайпы не трогает', async () => {
    window.location.hash = '#tgWebAppPlatform=ios'
    const { initTelegram } = await load()
    const webApp = fakeWebApp('6.9')

    const starting = initTelegram()
    window.Telegram = { WebApp: webApp }
    sdkScript()?.dispatchEvent(new Event('load'))
    await starting

    expect(webApp.disableVerticalSwipes).not.toHaveBeenCalled()
  })

  it('SDK загружается один раз', async () => {
    const { loadTelegram } = await load()

    void loadTelegram()
    void loadTelegram()

    expect(
      document.head.querySelectorAll('script[src*="telegram-web-app"]'),
    ).toHaveLength(1)
  })

  it('без SDK (нет сети, блокировка) работает как сайт', async () => {
    window.location.hash = '#tgWebAppPlatform=android'
    const { initTelegram, useTelegramStore } = await load()

    const starting = initTelegram()
    sdkScript()?.dispatchEvent(new Event('error'))

    expect(await starting).toBeNull()
    expect(useTelegramStore.getState().webApp).toBeNull()
  })

  it('скрипт загрузился, но объекта WebApp нет', async () => {
    window.location.hash = '#tgWebAppPlatform=android'
    const { initTelegram } = await load()

    const starting = initTelegram()
    sdkScript()?.dispatchEvent(new Event('load'))

    expect(await starting).toBeNull()
  })
})
