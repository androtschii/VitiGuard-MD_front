// Координаты съёмки из EXIF фотографии (pr-038). Разбирается только то, что
// нужно: блок APP1 «Exif» в JPEG, заголовок TIFF, ссылка на GPS IFD в IFD0
// и теги широты и долготы. Файл не покидает браузер до отправки на анализ

export type GpsPoint = { latitude: number; longitude: number }

const GPS_IFD = 0x8825
const LAT_REF = 1
const LAT = 2
const LON_REF = 3
const LON = 4
const RATIONAL = 5
const ASCII = 2

// Метаданные лежат в начале файла: читать весь снимок на 10 МБ незачем
const HEAD_BYTES = 256 * 1024

function readIfd(
  view: DataView,
  tiff: number,
  offset: number,
  little: boolean,
) {
  const entries = new Map<number, { type: number; count: number; at: number }>()
  if (tiff + offset + 2 > view.byteLength) return entries
  const count = view.getUint16(tiff + offset, little)
  for (let i = 0; i < count; i++) {
    const at = tiff + offset + 2 + i * 12
    if (at + 12 > view.byteLength) break
    entries.set(view.getUint16(at, little), {
      type: view.getUint16(at + 2, little),
      count: view.getUint32(at + 4, little),
      at: at + 8,
    })
  }
  return entries
}

// Градусы, минуты и секунды — три дроби; значения длиннее 4 байт лежат по ссылке
function degrees(
  view: DataView,
  tiff: number,
  entry: { type: number; count: number; at: number } | undefined,
  little: boolean,
) {
  if (!entry || entry.type !== RATIONAL || entry.count !== 3) return null
  const start = tiff + view.getUint32(entry.at, little)
  if (start + 24 > view.byteLength) return null
  const parts = [0, 1, 2].map((i) => {
    const numerator = view.getUint32(start + i * 8, little)
    const denominator = view.getUint32(start + i * 8 + 4, little)
    return denominator ? numerator / denominator : Number.NaN
  })
  const [d = 0, m = 0, s = 0] = parts
  const value = d + m / 60 + s / 3600
  return Number.isFinite(value) ? value : null
}

function ref(
  view: DataView,
  entry: { type: number; count: number; at: number } | undefined,
) {
  if (!entry || entry.type !== ASCII) return null
  return String.fromCharCode(view.getUint8(entry.at))
}

function tiffGps(view: DataView, tiff: number): GpsPoint | null {
  const order = view.getUint16(tiff)
  if (order !== 0x4949 && order !== 0x4d4d) return null
  const little = order === 0x4949
  const ifd0 = readIfd(view, tiff, view.getUint32(tiff + 4, little), little)
  const pointer = ifd0.get(GPS_IFD)
  if (!pointer) return null
  const gps = readIfd(view, tiff, view.getUint32(pointer.at, little), little)
  const lat = degrees(view, tiff, gps.get(LAT), little)
  const lon = degrees(view, tiff, gps.get(LON), little)
  if (lat === null || lon === null) return null
  // Нули вместо координат пишут камеры, у которых не было сигнала
  if (lat === 0 && lon === 0) return null
  return {
    latitude: ref(view, gps.get(LAT_REF)) === 'S' ? -lat : lat,
    longitude: ref(view, gps.get(LON_REF)) === 'W' ? -lon : lon,
  }
}

// Координаты из байтов JPEG или null: PNG и WebP с телефона обычно без GPS,
// а при отправке в мессенджерах EXIF часто вырезается
export function parseExifGps(buffer: ArrayBuffer): GpsPoint | null {
  const view = new DataView(buffer)
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null
  let offset = 2
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset)
    const length = view.getUint16(offset + 2)
    // Начало сжатых данных: метаданные бывают только раньше
    if (marker === 0xffda || (marker & 0xff00) !== 0xff00) return null
    if (
      marker === 0xffe1 &&
      offset + 10 <= view.byteLength &&
      view.getUint32(offset + 4) === 0x45786966 // «Exif»
    ) {
      return tiffGps(view, offset + 10)
    }
    offset += 2 + length
  }
  return null
}

export async function readPhotoGps(file: Blob) {
  try {
    return parseExifGps(await file.slice(0, HEAD_BYTES).arrayBuffer())
  } catch {
    // Повреждённые метаданные — то же, что их отсутствие
    return null
  }
}
