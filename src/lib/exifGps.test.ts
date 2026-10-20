import { describe, expect, it } from 'vitest'
import { parseExifGps, readPhotoGps } from './exifGps'

type Rational = [number, number]

// Минимальный JPEG: SOI, APP1 с Exif (IFD0 → GPS IFD) и SOS
function jpeg({
  little = true,
  lat = [
    [47, 1],
    [8, 1],
    [2400, 100],
  ] as Rational[],
  lon = [
    [28, 1],
    [51, 1],
    [3600, 100],
  ] as Rational[],
  latRef = 'N',
  lonRef = 'E',
  withGps = true,
  order = undefined as number[] | undefined,
  ifd0 = 8,
  refType = 2,
  latAt = 80,
} = {}) {
  const tiff: number[] = []
  const u16 = (v: number) => (little ? [v & 0xff, v >> 8] : [v >> 8, v & 0xff])
  const u32 = (v: number) => {
    const bytes = [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, v >>> 24]
    return little ? bytes : bytes.reverse()
  }
  const entry = (tag: number, type: number, count: number, value: number[]) => [
    ...u16(tag),
    ...u16(type),
    ...u32(count),
    ...value,
  ]
  // Заголовок TIFF: порядок байт, 42, смещение IFD0 = 8
  const byteOrder = order ?? (little ? [0x49, 0x49] : [0x4d, 0x4d])
  tiff.push(...byteOrder, ...u16(42), ...u32(ifd0))
  // IFD0: одна запись — ссылка на GPS IFD по смещению 26
  tiff.push(...u16(1), ...entry(0x8825, 4, 1, u32(withGps ? 26 : 0)), ...u32(0))
  // GPS IFD: 4 записи, дроби — после него (26 + 2 + 48 + 4 = 80)
  const ascii = (c: string) => [c.charCodeAt(0), 0, 0, 0]
  tiff.push(
    ...u16(4),
    ...entry(1, refType, 2, ascii(latRef)),
    ...entry(2, 5, 3, u32(latAt)),
    ...entry(3, refType, 2, ascii(lonRef)),
    ...entry(4, 5, 3, u32(104)),
    ...u32(0),
  )
  for (const [n, d] of [...lat, ...lon]) tiff.push(...u32(n), ...u32(d))
  const exif = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff]
  const app1 = [0xff, 0xe1, (exif.length + 2) >> 8, (exif.length + 2) & 0xff]
  return new Uint8Array([0xff, 0xd8, ...app1, ...exif, 0xff, 0xda, 0, 2]).buffer
}

describe('parseExifGps', () => {
  it('читает широту и долготу в градусах', () => {
    const point = parseExifGps(jpeg())

    expect(point?.latitude).toBeCloseTo(47.14, 4)
    expect(point?.longitude).toBeCloseTo(28.86, 4)
  })

  it('понимает порядок байт Motorola и южное и западное полушария', () => {
    const point = parseExifGps(
      jpeg({ little: false, latRef: 'S', lonRef: 'W' }),
    )

    expect(point?.latitude).toBeCloseTo(-47.14, 4)
    expect(point?.longitude).toBeCloseTo(-28.86, 4)
  })

  it('пропускает другие блоки перед Exif', () => {
    const exif = new Uint8Array(jpeg())
    const app0 = [0xff, 0xe0, 0, 4, 0, 0]
    const file = new Uint8Array([0xff, 0xd8, ...app0, ...exif.slice(2)])

    expect(parseExifGps(file.buffer)?.latitude).toBeCloseTo(47.14, 4)
  })

  it('нули без сигнала и деление на ноль — не координаты', () => {
    const zero: Rational[] = [
      [0, 1],
      [0, 1],
      [0, 1],
    ]
    expect(parseExifGps(jpeg({ lat: zero, lon: zero }))).toBeNull()
    expect(
      parseExifGps(
        jpeg({
          lat: [
            [47, 0],
            [0, 1],
            [0, 1],
          ],
        }),
      ),
    ).toBeNull()
  })

  it('без GPS, Exif или JPEG возвращает null', () => {
    expect(parseExifGps(jpeg({ withGps: false }))).toBeNull()
    expect(
      parseExifGps(new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer),
    ).toBeNull()
    expect(
      parseExifGps(new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2]).buffer),
    ).toBeNull()
    expect(
      parseExifGps(new Uint8Array([0xff, 0xd8, 0x12, 0x34]).buffer),
    ).toBeNull()
    expect(parseExifGps(new ArrayBuffer(0))).toBeNull()
  })

  it('неизвестный порядок байт и ссылки за концом файла — не координаты', () => {
    expect(parseExifGps(jpeg({ order: [0x58, 0x58] }))).toBeNull()
    // IFD0 дальше конца файла
    expect(parseExifGps(jpeg({ ifd0: 60_000 }))).toBeNull()
    // Дроби широты дальше конца файла
    expect(parseExifGps(jpeg({ latAt: 60_000 }))).toBeNull()
  })

  it('полушарие не текстом считается северным и восточным', () => {
    const point = parseExifGps(jpeg({ latRef: 'S', lonRef: 'W', refType: 3 }))

    expect(point?.latitude).toBeCloseTo(47.14, 4)
    expect(point?.longitude).toBeCloseTo(28.86, 4)
  })

  it('обрезанный файл не роняет разбор', () => {
    const cut = jpeg().slice(0, 60)

    expect(parseExifGps(cut)).toBeNull()
  })
})

describe('readPhotoGps', () => {
  it('читает координаты из файла', async () => {
    const file = new File([jpeg()], 'leaf.jpg', { type: 'image/jpeg' })

    expect((await readPhotoGps(file))?.longitude).toBeCloseTo(28.86, 4)
  })

  it('ошибка чтения — нет координат', async () => {
    const broken = {
      slice: () => ({
        arrayBuffer: () => Promise.reject(new Error('read failed')),
      }),
    } as unknown as Blob

    expect(await readPhotoGps(broken)).toBeNull()
  })
})
