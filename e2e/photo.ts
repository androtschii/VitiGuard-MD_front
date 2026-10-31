// Фото листа с координатами съёмки в EXIF — как с камеры телефона. Пиксели
// не нужны: сервер подменён, а клиент читает из файла только GPS (pr-038)
type Rational = [number, number]

function dms(value: number): Rational[] {
  const degrees = Math.floor(value)
  const minutes = Math.floor((value - degrees) * 60)
  const seconds = Math.round(((value - degrees) * 60 - minutes) * 60 * 100)
  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 100],
  ]
}

export function leafPhotoAt(latitude: number, longitude: number): Buffer {
  const u16 = (v: number) => [v & 0xff, v >> 8]
  const u32 = (v: number) => [
    v & 0xff,
    (v >> 8) & 0xff,
    (v >> 16) & 0xff,
    v >>> 24,
  ]
  const entry = (tag: number, type: number, count: number, value: number[]) => [
    ...u16(tag),
    ...u16(type),
    ...u32(count),
    ...value,
  ]
  const ascii = (c: string) => [c.charCodeAt(0), 0, 0, 0]
  // TIFF: порядок байт Intel, IFD0 со ссылкой на GPS IFD, дроби — после него
  const tiff = [
    0x49,
    0x49,
    ...u16(42),
    ...u32(8),
    ...u16(1),
    ...entry(0x8825, 4, 1, u32(26)),
    ...u32(0),
    ...u16(4),
    ...entry(1, 2, 2, ascii('N')),
    ...entry(2, 5, 3, u32(80)),
    ...entry(3, 2, 2, ascii('E')),
    ...entry(4, 5, 3, u32(104)),
    ...u32(0),
  ]
  for (const [n, d] of [...dms(latitude), ...dms(longitude)])
    tiff.push(...u32(n), ...u32(d))
  const exif = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff]
  const app1 = [0xff, 0xe1, (exif.length + 2) >> 8, (exif.length + 2) & 0xff]
  return Buffer.from([
    0xff,
    0xd8,
    ...app1,
    ...exif,
    0xff,
    0xda,
    0,
    2,
    0xff,
    0xd9,
  ])
}
