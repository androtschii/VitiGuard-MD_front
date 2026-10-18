import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVineyards } from '@/api/vineyards'
import { type GpsPoint, readPhotoGps } from '@/lib/exifGps'
import { containsPoint } from '@/lib/geo'

type PhotoLocationProps = {
  file: File | null
}

// Где снято фото — по GPS из EXIF (pr-038) — и на каком из участков
// пользователя. Без координат в файле блок молчит: это обычное дело
export function PhotoLocation({ file }: PhotoLocationProps) {
  const { t, i18n } = useTranslation()
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

  const number = new Intl.NumberFormat(i18n.resolvedLanguage, {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
  })
  const plot = vineyards?.find((vineyard) =>
    containsPoint(vineyard.geometry, [point.longitude, point.latitude]),
  )

  return (
    <p className="text-sm text-ink-soft">
      {t('diagnosis.location.taken', {
        latitude: number.format(point.latitude),
        longitude: number.format(point.longitude),
      })}{' '}
      {plot
        ? t('diagnosis.location.onPlot', { name: plot.name })
        : t('diagnosis.location.offPlot')}
    </p>
  )
}
