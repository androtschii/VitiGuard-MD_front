export type LatLon = { lat: number; lon: number }

const NUMBER = String.raw`-?\d+(?:[.,]\d+)?`

// Широта и долгота в порядке, в каком их показывают Google и Яндекс Карты:
// «47.1405, 28.861», «47.1405,28.861», «47.1405 28.861», «47,1405; 28,861».
// Запятая бывает и десятичной, и разделителем: в каждом числе не больше одной
// дробной части, поэтому разбор однозначен
const PATTERN = new RegExp(`^(${NUMBER})\\s*[,;\\s]\\s*(${NUMBER})$`)

const toNumber = (text: string) => Number(text.replace(',', '.'))

export function parseCoordinates(text: string): LatLon | null {
  const match = PATTERN.exec(text.trim())
  if (!match?.[1] || !match[2]) return null
  const lat = toNumber(match[1])
  const lon = toNumber(match[2])
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null
  return { lat, lon }
}
