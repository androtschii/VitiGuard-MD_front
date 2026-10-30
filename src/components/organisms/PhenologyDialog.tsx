import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  STAGES,
  useDeletePhenology,
  usePhenology,
  useSavePhenology,
  type Stage,
} from '@/api/phenology'
import { harvestAllowedFrom, useTreatments } from '@/api/treatments'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { DeleteButton } from '@/components/molecules/DeleteButton'
import { Field } from '@/components/molecules/Field'
import { Modal } from '@/components/organisms/Modal'
import { WeatherEventsSection } from '@/components/organisms/WeatherEventsSection'
import { cn } from '@/lib/cn'
import { dayTime, localToday } from '@/lib/riskSeries'

const HARVEST_STAGE: Stage = 38

type PhenologyDialogProps = {
  vineyardId: string
  vineyardName: string
  open: boolean
  onClose: () => void
}

function SeasonScale({ current }: { current: Stage | null }) {
  const { t } = useTranslation()
  const index = current === null ? -1 : STAGES.indexOf(current)
  const percent = index < 0 ? 0 : (index / (STAGES.length - 1)) * 100

  return (
    <div>
      <p className="mb-3 font-medium text-ink">
        {current === null
          ? t('phenology.noCurrent')
          : t('phenology.current', {
              stage: t(`phenology.stages.${current}`),
            })}
      </p>
      {/* Подпись выше передаёт текущую фазу словами */}
      <div aria-hidden="true" className="relative h-5">
        <div className="absolute inset-x-0 top-2 h-1 rounded-full bg-muted-strong" />
        <div
          className="absolute top-2 left-0 h-1 origin-left rounded-full bg-linear-to-r from-brand-400 to-brand-700 motion-safe:animate-fill"
          style={{ width: `${percent}%` }}
        />
        {STAGES.map((stage, position) => (
          <span
            key={stage}
            style={
              {
                left: `${(position / (STAGES.length - 1)) * 100}%`,
                '--i': position,
              } as React.CSSProperties
            }
            className={cn(
              'stagger absolute top-2.5 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface motion-safe:animate-grow-in',
              position <= index ? 'bg-brand-700' : 'bg-line-strong',
              position === index && 'phenology-now size-4',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Журнал фаз развития лозы: от распускания почек до листопада
export function PhenologyDialog({
  vineyardId,
  vineyardName,
  open,
  onClose,
}: PhenologyDialogProps) {
  const { t, i18n } = useTranslation()
  const today = localToday()
  const day = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })

  const observations = usePhenology(vineyardId, open)
  const save = useSavePhenology(vineyardId)
  const remove = useDeletePhenology(vineyardId)
  const [observedOn, setObservedOn] = useState(today)
  const [stage, setStage] = useState<Stage>(4)

  // Журнал обработок нужен, только когда отмечают сбор
  const isHarvest = stage === HARVEST_STAGE
  const treatments = useTreatments(vineyardId, open && isHarvest)
  const harvestFrom = isHarvest
    ? harvestAllowedFrom(treatments.data ?? [], observedOn)
    : null

  const items = observations.data ?? []
  const year = today.slice(0, 4)
  const latest = items.find((item) => item.observed_on.startsWith(year))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({ observed_on: observedOn, stage })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('phenology.title', { name: vineyardName })}
      description={t('phenology.description')}
    >
      <div className="flex flex-col gap-5 text-sm">
        <SeasonScale current={latest?.stage ?? null} />

        <form
          onSubmit={submit}
          className="flex flex-col gap-3 rounded-lg border border-line bg-muted/30 p-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={t('phenology.date')} required>
              {(control) => (
                <Input
                  type="date"
                  value={observedOn}
                  max={today}
                  onChange={(event) => setObservedOn(event.target.value)}
                  required
                  {...control}
                />
              )}
            </Field>
            <Field label={t('phenology.stage')} required>
              {(control) => (
                <Select
                  value={stage}
                  onChange={(event) =>
                    setStage(Number(event.target.value) as Stage)
                  }
                  {...control}
                >
                  {STAGES.map((value) => (
                    <option key={value} value={value}>
                      {t(`phenology.stages.${value}`)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          {harvestFrom && (
            <p
              role="alert"
              className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
            >
              {t('phenology.harvestBlocked', {
                date: day.format(dayTime(harvestFrom)),
              })}
            </p>
          )}
          {save.isError && (
            <p role="alert" className="text-danger">
              {save.error.message}
            </p>
          )}
          <Button
            size="sm"
            type="submit"
            isLoading={save.isPending}
            className="self-start"
          >
            {t('phenology.save')}
          </Button>
        </form>

        {remove.isError && (
          <p role="alert" className="text-danger">
            {remove.error.message}
          </p>
        )}
        {observations.isPending ? (
          <p className="text-ink-muted">{t('common.loading')}</p>
        ) : observations.isError ? (
          <p className="text-ink-muted">{t('phenology.loadFailed')}</p>
        ) : items.length === 0 ? (
          <p className="text-ink-muted">{t('phenology.empty')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <span className="text-ink">
                  {day.format(dayTime(item.observed_on))} ·{' '}
                  {t(`phenology.stages.${item.stage}`)}
                </span>
                <DeleteButton
                  aria-label={t('phenology.deleteOne', {
                    date: day.format(dayTime(item.observed_on)),
                  })}
                  onClick={() => remove.mutate(item.id)}
                >
                  {t('phenology.delete')}
                </DeleteButton>
              </li>
            ))}
          </ul>
        )}

        <WeatherEventsSection vineyardId={vineyardId} />
      </div>
    </Modal>
  )
}
