import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Diagnosis } from '@/api/diagnosis'
import { SegmentedControl } from '@/components/molecules/SegmentedControl'

type Layer = 'heatmap' | 'lesion' | 'photo'

type DiagnosisOverlayProps = {
  photoUrl: string
  diagnosis: Diagnosis
}

// Фото листа с наложением: тепловая карта (куда смотрела модель) или маска
// поражения. Наложения сервер отдаёт в пропорциях фото, поэтому картинка той
// же ширины ложится точно поверх него
export function DiagnosisOverlay({
  photoUrl,
  diagnosis,
}: DiagnosisOverlayProps) {
  const { t, i18n } = useTranslation()
  const { heatmap, lesion } = diagnosis
  const options = [
    ...(heatmap
      ? [{ value: 'heatmap' as const, label: t('diagnosis.layers.heatmap') }]
      : []),
    ...(lesion
      ? [{ value: 'lesion' as const, label: t('diagnosis.layers.lesion') }]
      : []),
    { value: 'photo' as const, label: t('diagnosis.layers.photo') },
  ]
  const [layer, setLayer] = useState<Layer>(options[0].value)
  const overlay =
    layer === 'heatmap' ? heatmap : layer === 'lesion' ? lesion?.mask : null
  const percent = new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    maximumFractionDigits: 0,
  })

  if (!heatmap && !lesion) return null

  return (
    <section
      aria-labelledby="diagnosis-overlay"
      className="flex flex-col gap-2"
    >
      <h3 id="diagnosis-overlay" className="text-sm font-semibold text-ink">
        {t('diagnosis.layers.title')}
      </h3>
      <SegmentedControl
        label={t('diagnosis.layers.title')}
        options={options}
        value={layer}
        onChange={setLayer}
        className="self-start"
      />
      <div className="relative self-center overflow-hidden rounded-md">
        <img
          src={photoUrl}
          alt={t('diagnosis.preview')}
          className="block max-h-72 w-auto"
        />
        {overlay && (
          <img
            src={overlay}
            alt=""
            className="absolute inset-0 size-full motion-safe:animate-rise"
          />
        )}
      </div>
      <p className="text-sm text-ink-muted">
        {layer === 'lesion' && lesion
          ? t('diagnosis.layers.severity', {
              value: percent.format(lesion.severity),
            })
          : layer === 'heatmap'
            ? t('diagnosis.layers.heatmapHint')
            : null}
      </p>
    </section>
  )
}
