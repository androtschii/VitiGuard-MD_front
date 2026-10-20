import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { useMap } from '@/lib/mapContext'
import {
  captureMap,
  mapFileName,
  saveBlob,
  toJpegBytes,
  toPngBlob,
  withTitle,
} from '@/lib/mapImage'
import { imagePdf } from '@/lib/pdf'

type Format = 'png' | 'pdf'

// Сохранение видимой части карты в PNG или PDF: с участками, слоями и
// подписью источников; в PDF над картой — заголовок с датой
export function MapExportControl() {
  const { t, i18n } = useTranslation()
  const map = useMap()
  const [saving, setSaving] = useState<Format | null>(null)
  const [hasFailed, setHasFailed] = useState(false)

  if (!map) return null

  const save = async (format: Format) => {
    setSaving(format)
    setHasFailed(false)
    try {
      const now = new Date()
      const frame = await captureMap(map)
      if (format === 'png') {
        saveBlob(await toPngBlob(frame), mapFileName(now))
      } else {
        const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
          dateStyle: 'long',
        }).format(now)
        const page = withTitle(frame, t('mapExport.title', { date }))
        const pdf = imagePdf(await toJpegBytes(page), page.width, page.height)
        saveBlob(
          new Blob([pdf], { type: 'application/pdf' }),
          mapFileName(now, 'pdf'),
        )
      }
    } catch {
      setHasFailed(true)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink-soft">
        {t('mapExport.save')}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {(['png', 'pdf'] as const).map((format) => (
          <Button
            key={format}
            size="sm"
            variant="secondary"
            aria-label={t(`mapExport.${format}`)}
            isLoading={saving === format}
            disabled={saving !== null}
            onClick={() => void save(format)}
          >
            {format.toUpperCase()}
          </Button>
        ))}
      </div>
      {hasFailed && (
        <p role="alert" className="text-xs text-danger">
          {t('mapExport.failed')}
        </p>
      )}
    </div>
  )
}
