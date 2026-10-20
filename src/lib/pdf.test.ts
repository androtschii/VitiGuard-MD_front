import { describe, expect, it } from 'vitest'
import { fitImage, imagePdf, LANDSCAPE, PORTRAIT } from './pdf'

const text = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes)

describe('pdf', () => {
  it('вписывает картинку в страницу с полями по центру', () => {
    // Широкая картинка упирается в поля по ширине
    const wide = fitImage(1600, 600)
    expect(wide.w).toBeCloseTo(LANDSCAPE.width - LANDSCAPE.margin * 2)
    expect(wide.x).toBeCloseTo(LANDSCAPE.margin)
    expect(wide.y).toBeCloseTo((LANDSCAPE.height - wide.h) / 2)
    // Высокая — по высоте
    const tall = fitImage(600, 1600)
    expect(tall.h).toBeCloseTo(LANDSCAPE.height - LANDSCAPE.margin * 2)
    expect(tall.x).toBeCloseTo((LANDSCAPE.width - tall.w) / 2)
  })

  it('книжная страница — для карточки в пропорциях A4', () => {
    const page = fitImage(1240, 1754, PORTRAIT)

    // Лист чуть уже страницы с полями — упирается в поля по ширине
    expect(page.w).toBeCloseTo(PORTRAIT.width - PORTRAIT.margin * 2)
    expect(page.y).toBeGreaterThanOrEqual(PORTRAIT.margin)
    expect(text(imagePdf(new Uint8Array([1]), 1240, 1754, PORTRAIT))).toContain(
      '/MediaBox [0 0 595 842]',
    )
  })

  it('собирает страницу A4 с картинкой JPEG как есть', () => {
    const jpeg = new Uint8Array([255, 216, 255, 224, 1, 2, 3, 255, 217])

    const file = text(imagePdf(jpeg, 800, 600))

    expect(file.startsWith('%PDF-1.4\n')).toBe(true)
    expect(file.trimEnd().endsWith('%%EOF')).toBe(true)
    expect(file).toContain('/MediaBox [0 0 842 595]')
    expect(file).toContain('/Width 800 /Height 600')
    expect(file).toContain(`/Filter /DCTDecode /Length ${jpeg.length}`)
    expect(file).toContain(text(jpeg))
  })

  it('таблица смещений указывает на начала объектов', () => {
    const file = text(imagePdf(new Uint8Array([255, 216, 255, 217]), 10, 10))

    const xref = Number(/startxref\n(\d+)/.exec(file)?.[1])
    expect(file.slice(xref, xref + 4)).toBe('xref')
    const offsets = [...file.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map(
      (match) => Number(match[1]),
    )
    expect(offsets).toHaveLength(5)
    offsets.forEach((offset, index) => {
      expect(file.slice(offset)).toMatch(new RegExp(`^${index + 1} 0 obj\\n`))
    })
  })
})
