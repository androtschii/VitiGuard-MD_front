import { useTranslation } from 'react-i18next'
import type { PhotoLocation as Location } from '@/lib/usePhotoLocation'

type PhotoLocationProps = {
  location: Location
}

// Подпись под фото: где оно снято и на каком участке. Без координат в файле
// подписи нет: это обычное дело
export function PhotoLocation({ location }: PhotoLocationProps) {
  const { t, i18n } = useTranslation()
  if (!location) return null

  const { point, plot } = location
  const number = new Intl.NumberFormat(i18n.resolvedLanguage, {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
  })

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
