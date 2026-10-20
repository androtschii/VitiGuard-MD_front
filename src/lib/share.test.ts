import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { record } from '@/test/historyData'
import { share, shareText } from './share'

const file = new File(['%PDF'], 'card.pdf', { type: 'application/pdf' })

function stubNavigator(values: Partial<Navigator>) {
  for (const [name, value] of Object.entries(values)) {
    vi.stubGlobal('navigator', { ...navigator, [name]: value })
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('share', () => {
  it('описание проверки — без ссылки, с участком и датой', () => {
    expect(shareText(record('r-1'), i18n.t, 'ru')).toMatch(
      /^VitiGuard MD: Чёрная гниль \(уверенность модели 93\s%\), Криково, 10 июня 2026/,
    )
    expect(
      shareText(record('r-2', { vineyard_name: null }), i18n.t, 'ru'),
    ).toContain('Без участка')
  })

  it('делится файлом, если браузер умеет', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      share: send,
      canShare: () => true,
    })

    expect(await share('Заголовок', 'Текст', file)).toBe('shared')
    expect(send).toHaveBeenCalledWith({
      title: 'Заголовок',
      text: 'Текст',
      files: [file],
    })
  })

  it('без поддержки файлов — только текст', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    stubNavigator({ share: send })

    await share('Заголовок', 'Текст', file)

    expect(send).toHaveBeenCalledWith({ title: 'Заголовок', text: 'Текст' })
  })

  it('закрытое меню — не ошибка, а другие сбои передаются', async () => {
    stubNavigator({
      share: vi.fn().mockRejectedValue(new DOMException('', 'AbortError')),
    })
    expect(await share('', 'Текст', null)).toBe('cancelled')

    stubNavigator({
      share: vi.fn().mockRejectedValue(new DOMException('', 'NotAllowedError')),
    })
    await expect(share('', 'Текст', null)).rejects.toThrow()
  })

  it('без Web Share копирует описание', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      share: undefined,
      clipboard: { writeText },
    })

    expect(await share('', 'Текст', file)).toBe('copied')
    expect(writeText).toHaveBeenCalledWith('Текст')
  })
})
