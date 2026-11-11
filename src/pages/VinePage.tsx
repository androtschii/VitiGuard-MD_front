import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDetectVine, type VineLabel } from '@/api/vine'
import { useNavItems } from '@/app/navigation'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { DiagnosisTabs } from '@/components/molecules/DiagnosisTabs'
import { LeafUpload } from '@/components/organisms/LeafUpload'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { SaveOptions } from '@/components/organisms/SaveOptions'
import { VineOverlay } from '@/components/organisms/VineOverlay'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'
import { cn } from '@/lib/cn'
import { useObjectUrl } from '@/lib/useObjectUrl'
import { VINE_COLORS } from '@/lib/vineColors'

const LABELS: VineLabel[] = ['trunk', 'bunch']
// Сервер отдаёт рамки от 25 %: ползунок только поднимает порог
const MIN_CONFIDENCE = 25

// Стволы и грозди на фото ряда — то, что видит камера робота-сборщика
export function VinePage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const [file, setFile] = useState<File | null>(null)
  const photoUrl = useObjectUrl(file)
  const detect = useDetectVine()
  const [shown, setShown] = useState<Record<VineLabel, boolean>>({
    trunk: true,
    bunch: true,
  })
  const [threshold, setThreshold] = useState(MIN_CONFIDENCE)
  const [save, setSave] = useState(true)
  const [vineyardId, setVineyardId] = useState('')

  const visible = useMemo(
    () =>
      (detect.data?.detections ?? []).filter(
        (item) => shown[item.label] && item.confidence * 100 >= threshold,
      ),
    [detect.data, shown, threshold],
  )
  const count = (label: VineLabel) =>
    visible.filter((item) => item.label === label).length

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <DiagnosisTabs />
      <h1 className="mb-1 text-xl font-semibold text-ink">{t('vine.title')}</h1>
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">{t('vine.intro')}</p>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card title={t('vine.photo')} className="flex flex-col gap-3">
          <LeafUpload
            file={file}
            inputLabel={t('vine.input')}
            previewAlt={t('vine.photoAlt')}
            onSelect={(picked) => {
              setFile(picked)
              detect.reset()
            }}
          />
          <SaveOptions
            save={save}
            onSaveChange={setSave}
            vineyardId={vineyardId}
            onVineyardChange={setVineyardId}
          />
          <Button
            className="w-full"
            disabled={!file}
            isLoading={detect.isPending}
            // Кнопка без фото недоступна
            onClick={() =>
              detect.mutate({ image: file as File, save, vineyardId })
            }
          >
            {t('vine.analyze')}
          </Button>
          <p className="text-xs text-ink-subtle">{t('vine.tips')}</p>
        </Card>

        <Card title={t('vine.result')}>
          <div aria-live="polite" className="flex flex-col gap-4">
            {detect.isPending && (
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <Spinner className="text-accent" />
                {t('vine.analyzing')}
              </p>
            )}
            {detect.isError && (
              <p role="alert" className="text-sm text-danger">
                {detect.error.message}
              </p>
            )}
            {detect.isIdle && (
              <p className="text-sm text-ink-muted">{t('vine.empty')}</p>
            )}
            {detect.isSuccess && photoUrl && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {LABELS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={shown[label]}
                      onClick={() =>
                        setShown((prev) => ({ ...prev, [label]: !prev[label] }))
                      }
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors',
                        shown[label]
                          ? 'border-line-strong bg-surface text-ink'
                          : 'border-line bg-muted/40 text-ink-subtle line-through',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'size-2.5 rounded-full',
                          VINE_COLORS[label].chip,
                        )}
                      />
                      {t(`vine.count.${label}`, { count: count(label) })}
                    </button>
                  ))}
                  <label className="ml-auto flex items-center gap-2 text-sm text-ink-muted">
                    {t('vine.threshold', { value: threshold })}
                    <input
                      type="range"
                      min={MIN_CONFIDENCE}
                      max={90}
                      step={5}
                      value={threshold}
                      onChange={(event) =>
                        setThreshold(Number(event.target.value))
                      }
                      className="w-28 accent-brand-600"
                    />
                  </label>
                </div>
                <VineOverlay photoUrl={photoUrl} detections={visible} />
                {detect.data.detections.length === 0 && (
                  <p className="text-sm text-ink-muted">{t('vine.nothing')}</p>
                )}
                {detect.data.id && (
                  <p role="status" className="text-sm text-accent">
                    {t('vine.saved')}
                  </p>
                )}
                <p className="text-xs text-ink-subtle">
                  {t('vine.model', { name: detect.data.model })}
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    </DashboardTemplate>
  )
}
