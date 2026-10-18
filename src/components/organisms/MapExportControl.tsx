import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { useMap } from '@/lib/mapContext'
import { captureMap, mapFileName, saveBlob, toPngBlob } from '@/lib/mapImage'

// Сохранение видимой части карты в PNG (pr-033): с участками, слоями и
// подписью источников
export function MapExportControl() {
  const { t } = useTranslation()
  const map = useMap()
  const [isSaving, setIsSaving] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  if (!map) return null

  const save = async () => {
    setIsSaving(true)
    setHasFailed(false)
    try {
      saveBlob(await toPngBlob(await captureMap(map)), mapFileName())
    } catch {
      setHasFailed(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        variant="secondary"
        isLoading={isSaving}
        onClick={() => void save()}
      >
        {t('mapExport.save')}
      </Button>
      {hasFailed && (
        <p role="alert" className="text-xs text-danger">
          {t('mapExport.failed')}
        </p>
      )}
    </div>
  )
}
