import { useEffect, useState } from 'react'
import { useVineyards, type Vineyard } from '@/api/vineyards'
import { type GpsPoint, readPhotoGps } from '@/lib/exifGps'
import { containsPoint } from '@/lib/geo'

export type PhotoLocation = {
  point: GpsPoint
  // Участок пользователя, на котором снято фото; null — вне участков
  plot: Vineyard | null
} | null

// Где снято фото — по GPS из EXIF (pr-038) — и на каком из участков
// пользователя. Нужно и подписи под фото, и выбору участка при сохранении
export function usePhotoLocation(file: File | null): PhotoLocation {
  const [gps, setGps] = useState<{ file: File; point: GpsPoint } | null>(null)
  const { data: vineyards } = useVineyards()

  useEffect(() => {
    if (!file) return
    let isCurrent = true
    void readPhotoGps(file).then((point) => {
      if (isCurrent && point) setGps({ file, point })
    })
    return () => {
      isCurrent = false
    }
  }, [file])

  // Координаты от прежнего фото к новому не относятся
  const point = gps && gps.file === file ? gps.point : null
  if (!point) return null
  const plot =
    vineyards?.find((vineyard) =>
      containsPoint(vineyard.geometry, [point.longitude, point.latitude]),
    ) ?? null
  return { point, plot }
}
