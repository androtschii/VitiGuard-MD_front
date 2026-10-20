import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { record } from '@/test/historyData'
import * as mapImage from './mapImage'
import {
  diagnosisPdf,
  drawReport,
  reportFileName,
  reportLines,
  SHEET,
  wrapText,
} from './diagnosisReport'

// Каждый символ — 10 пикселей
const measure = { measureText: (text: string) => ({ width: text.length * 10 }) }

function fakeContext() {
  return {
    ...measure,
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    font: '',
    fillStyle: '',
    textBaseline: '',
    globalAlpha: 1,
  }
}

const photo = {
  image: document.createElement('canvas'),
  width: 2000,
  height: 1000,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('diagnosisReport', () => {
  it('переносит текст по словам', () => {
    expect(
      wrapText(measure as never, 'Пятна на листе и налёт снизу', 120),
    ).toEqual(['Пятна на', 'листе и', 'налёт снизу'])
    expect(wrapText(measure as never, 'Сверхдлинноеслово', 50)).toEqual([
      'Сверхдлинноеслово',
    ])
    expect(wrapText(measure as never, '  ', 50)).toEqual([])
  })

  it('строки карточки со всеми сведениями', () => {
    const lines = reportLines(
      record('r-1', {
        severity: 0.18,
        location: { lat: 47.14012, lon: 28.86 },
        review: {
          disease: 'esca',
          comment: 'Тигровые полосы',
          reviewed_at: '2026-06-11T08:00:00Z',
          reviewer: 'Мария',
        },
      }),
      i18n.t,
      'ru',
    ).map((line) => line.text)

    expect(lines).toEqual([
      'Чёрная гниль',
      expect.stringMatching(/^Уверенность модели: 93\s%$/),
      expect.stringMatching(/^Поражено около 18\s% площади листа/),
      'Мария: на самом деле — Эска',
      '«Тигровые полосы»',
      'Участок: Криково',
      expect.stringMatching(/^Снято: 10 июня 2026/),
      'Координаты съёмки: 47.14012, 28.86000',
      'Вероятности болезней',
      expect.stringMatching(/^Чёрная гниль — 93\s%$/),
      expect.stringMatching(/^Милдью — 4\s%$/),
      'Модель efficientnet_b0, версия 82c7cbf32ff86379',
      expect.stringMatching(/^Диагноз модели — ориентир/),
    ])
  })

  it('без доли, координат, участка и с подтверждённым диагнозом', () => {
    const lines = reportLines(
      record('r-2', {
        disease: 'healthy',
        vineyard_name: null,
        review: {
          disease: 'healthy',
          comment: null,
          reviewed_at: '2026-06-11T08:00:00Z',
          reviewer: null,
        },
      }),
      i18n.t,
      'ru',
    )

    expect(lines[0]).toMatchObject({ text: 'Здоровый лист', color: '#047857' })
    const texts = lines.map((line) => line.text)
    expect(texts).toContain('Агроном: диагноз подтверждён')
    expect(texts).toContain('Без участка')
    expect(texts.some((text) => text.startsWith('Поражено'))).toBe(false)
    expect(texts.some((text) => text.startsWith('Координаты'))).toBe(false)
  })

  it('рисует страницу: заголовок, фото с маской и строки', () => {
    const context = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as never,
    )
    const lesion = document.createElement('canvas')

    const sheet = drawReport('Заголовок', photo, lesion, [
      { text: 'Чёрная гниль', size: 52, color: '#b91c1c', weight: 700 },
    ])

    expect([sheet.width, sheet.height]).toEqual([SHEET.width, SHEET.height])
    expect(context.fillText).toHaveBeenCalledWith('Заголовок', 90, 90)
    // Фото 2:1 вписано по ширине полей: 1060 × 530
    expect(context.drawImage).toHaveBeenCalledWith(
      photo.image,
      90,
      160,
      1060,
      530,
    )
    expect(context.drawImage).toHaveBeenCalledWith(lesion, 90, 160, 1060, 530)
    expect(context.globalAlpha).toBe(1)
    expect(context.fillText).toHaveBeenCalledWith('Чёрная гниль', 90, 740)
  })

  it('строки, не поместившиеся на страницу, обрезаются', () => {
    const context = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as never,
    )
    const many = Array.from({ length: 80 }, (_, index) => ({
      text: `Строка ${index}`,
      size: 30,
      color: '#000',
    }))

    drawReport('Заголовок', photo, null, many)

    const drawn = context.fillText.mock.calls.length - 1
    expect(drawn).toBeGreaterThan(10)
    expect(drawn).toBeLessThan(80)
    expect(context.drawImage).toHaveBeenCalledTimes(1)
  })

  it('без Canvas 2D — ошибка', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

    expect(() => drawReport('', photo, null, [])).toThrow('Canvas 2D')
  })

  it('имя файла — с датой и началом номера проверки', () => {
    expect(reportFileName(record('3f1c9a0b-7d2e'))).toBe(
      'vitiguard-diagnosis-2026-06-10-3f1c9a0b.pdf',
    )
  })

  it('собирает PDF книжной страницы из фото и маски', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeContext() as never,
    )
    const bitmap = vi.fn<(blob: Blob) => Promise<ImageBitmap>>(() =>
      Promise.resolve({ width: 800, height: 600 } as ImageBitmap),
    )
    vi.stubGlobal('createImageBitmap', bitmap)
    vi.spyOn(mapImage, 'toJpegBytes').mockResolvedValue(
      new Uint8Array([255, 216, 255, 217]),
    )
    const photoFile = new Blob(['jpeg'])
    const mask = new Blob(['png'])

    const pdf = await diagnosisPdf(record('r-3'), photoFile, mask, i18n.t, 'ru')

    expect(pdf.type).toBe('application/pdf')
    const text = new TextDecoder('latin1').decode(await pdf.arrayBuffer())
    expect(text).toContain('/MediaBox [0 0 595 842]')
    expect(text).toContain(`/Width ${SHEET.width} /Height ${SHEET.height}`)
    expect(bitmap.mock.calls.map(([blob]) => blob)).toEqual([photoFile, mask])

    bitmap.mockClear()
    await diagnosisPdf(record('r-3'), photoFile, null, i18n.t, 'ru')
    expect(bitmap).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })
})
