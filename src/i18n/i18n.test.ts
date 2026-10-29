import { afterEach, describe, expect, it } from 'vitest'
import i18n, { i18nReady } from '@/i18n'

afterEach(async () => {
  await i18n.changeLanguage('ru')
})

describe('i18n', () => {
  it('язык загружается при переключении, тексты — его', async () => {
    await i18nReady
    await i18n.changeLanguage('ro')

    expect(i18n.hasResourceBundle('ro', 'translation')).toBe(true)
    expect(i18n.t('theme.label')).toBe('Tema')
    expect(document.documentElement.lang).toBe('ro')
  })

  it('региональный вариант сводится к поддерживаемому языку', async () => {
    await i18n.changeLanguage('en-GB')

    expect(i18n.resolvedLanguage).toBe('en')
    expect(i18n.t('theme.label')).toBe('Theme')
  })

  it('неподдерживаемый язык — русский', async () => {
    await i18n.changeLanguage('de')

    expect(i18n.resolvedLanguage).toBe('ru')
    expect(i18n.t('theme.label')).toBe('Тема')
  })

  it('запасной язык поддерживаемому не нужен', () => {
    const fallback = i18n.options.fallbackLng as (code?: string) => string[]

    expect(fallback('ro')).toEqual([])
    expect(fallback('en-GB')).toEqual([])
    expect(fallback('de')).toEqual(['ru'])
    expect(fallback()).toEqual(['ru'])
  })
})

describe('загрузка переводов', () => {
  it('для языка без перевода — ошибка, а не пустые тексты', async () => {
    type BackendRead = {
      read: (
        language: string,
        namespace: string,
        callback: (error: unknown, data: unknown) => void,
      ) => void
    }
    const { backend } = i18n.services.backendConnector as unknown as {
      backend: BackendRead
    }

    const result = await new Promise<[unknown, unknown]>((resolve) => {
      backend.read('de', 'translation', (error, data) => resolve([error, data]))
    })

    expect(String(result[0])).toContain('Нет перевода: de')
    expect(result[1]).toBe(false)
  })
})
