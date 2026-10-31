import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  estimateKg,
  useDeleteHarvest,
  useHarvests,
  useSaveHarvest,
} from '@/api/harvests'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { DeleteButton } from '@/components/molecules/DeleteButton'
import { Field } from '@/components/molecules/Field'
import { Modal } from '@/components/organisms/Modal'

type HarvestDialogProps = {
  vineyardId: string
  vineyardName: string
  areaHa: number
  open: boolean
  onClose: () => void
}

const toNumber = (value: string) => (value === '' ? null : Number(value))

// Урожай по сезонам: прогноз по подсчёту гроздей и факт после сбора
export function HarvestDialog({
  vineyardId,
  vineyardName,
  areaHa,
  open,
  onClose,
}: HarvestDialogProps) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 1,
  })
  const harvests = useHarvests(vineyardId, open)
  const save = useSaveHarvest(vineyardId)
  const remove = useDeleteHarvest(vineyardId)

  const year = new Date().getFullYear()
  const [season, setSeason] = useState(String(year))
  const [vines, setVines] = useState('')
  const [bunches, setBunches] = useState('')
  const [bunchGrams, setBunchGrams] = useState('')
  const [estimated, setEstimated] = useState('')
  const [actual, setActual] = useState('')
  const [brix, setBrix] = useState('')

  const counted =
    vines && bunches && bunchGrams
      ? estimateKg(Number(vines), Number(bunches), Number(bunchGrams))
      : null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({
      season: Number(season),
      estimated_kg: toNumber(estimated),
      actual_kg: toNumber(actual),
      sugar_brix: toNumber(brix),
    })
  }

  const items = harvests.data ?? []
  const largest = Math.max(
    1,
    ...items.flatMap((item) => [item.estimated_kg ?? 0, item.actual_kg ?? 0]),
  )
  const perHa = (kg: number) => (areaHa > 0 ? kg / 1000 / areaHa : 0)

  const bar = (kg: number | null, tone: string, label: string) =>
    kg !== null && (
      <div className="flex items-center gap-2 text-xs">
        <span className="w-16 shrink-0 text-ink-muted">{label}</span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            aria-hidden="true"
            className={`h-full origin-left rounded-full motion-safe:animate-fill ${tone}`}
            style={{ width: `${(kg / largest) * 100}%` }}
          />
        </div>
        <span className="w-32 shrink-0 text-right text-ink-soft tabular-nums">
          {t('harvest.value', {
            kg: number.format(kg),
            perHa: number.format(perHa(kg)),
          })}
        </span>
      </div>
    )

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('harvest.title', { name: vineyardName })}
      description={t('harvest.description')}
    >
      <div className="flex flex-col gap-5 text-sm">
        <section
          aria-labelledby="harvest-count"
          className="flex flex-col gap-3 rounded-lg border border-line p-3"
        >
          <h3 id="harvest-count" className="font-semibold text-ink">
            {t('harvest.countTitle')}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label={t('harvest.vines')}>
              {(control) => (
                <Input
                  type="number"
                  min={0}
                  value={vines}
                  onChange={(event) => setVines(event.target.value)}
                  {...control}
                />
              )}
            </Field>
            <Field label={t('harvest.bunches')}>
              {(control) => (
                <Input
                  type="number"
                  min={0}
                  value={bunches}
                  onChange={(event) => setBunches(event.target.value)}
                  {...control}
                />
              )}
            </Field>
            <Field label={t('harvest.bunchGrams')}>
              {(control) => (
                <Input
                  type="number"
                  min={0}
                  value={bunchGrams}
                  onChange={(event) => setBunchGrams(event.target.value)}
                  {...control}
                />
              )}
            </Field>
          </div>
          {counted !== null && (
            <div className="flex flex-wrap items-center gap-3">
              <p aria-live="polite" className="font-medium text-accent">
                {t('harvest.counted', { kg: number.format(counted) })}
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEstimated(String(Math.round(counted)))}
              >
                {t('harvest.useCounted')}
              </Button>
            </div>
          )}
        </section>

        <form
          onSubmit={submit}
          className="flex flex-col gap-3 rounded-lg border border-line bg-muted/30 p-3"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label={t('harvest.season')} required>
              {(control) => (
                <Input
                  type="number"
                  min={1950}
                  max={year}
                  value={season}
                  onChange={(event) => setSeason(event.target.value)}
                  required
                  {...control}
                />
              )}
            </Field>
            <Field label={t('harvest.estimated')}>
              {(control) => (
                <Input
                  type="number"
                  min={0}
                  value={estimated}
                  onChange={(event) => setEstimated(event.target.value)}
                  {...control}
                />
              )}
            </Field>
            <Field label={t('harvest.actual')}>
              {(control) => (
                <Input
                  type="number"
                  min={0}
                  value={actual}
                  onChange={(event) => setActual(event.target.value)}
                  {...control}
                />
              )}
            </Field>
            <Field label={t('harvest.brix')}>
              {(control) => (
                <Input
                  type="number"
                  min={0}
                  max={45}
                  step="0.1"
                  value={brix}
                  onChange={(event) => setBrix(event.target.value)}
                  {...control}
                />
              )}
            </Field>
          </div>
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
            {t('harvest.save')}
          </Button>
        </form>

        {remove.isError && (
          <p role="alert" className="text-danger">
            {remove.error.message}
          </p>
        )}
        {harvests.isPending ? (
          <p className="text-ink-muted">{t('common.loading')}</p>
        ) : harvests.isError ? (
          <p className="text-ink-muted">{t('harvest.loadFailed')}</p>
        ) : items.length === 0 ? (
          <p className="text-ink-muted">{t('harvest.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1.5 rounded-lg border border-line p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">
                    {item.season}
                    {item.sugar_brix !== null && (
                      <span className="ml-2 text-xs font-normal text-ink-muted">
                        {t('harvest.brixValue', {
                          value: number.format(item.sugar_brix),
                        })}
                      </span>
                    )}
                  </span>
                  <DeleteButton
                    aria-label={t('harvest.deleteOne', { season: item.season })}
                    isLoading={remove.isPending && remove.variables === item.id}
                    onClick={() => remove.mutate(item.id)}
                  >
                    {t('harvest.delete')}
                  </DeleteButton>
                </div>
                {bar(
                  item.estimated_kg,
                  'bg-brand-300',
                  t('harvest.estimatedShort'),
                )}
                {bar(item.actual_kg, 'bg-brand-700', t('harvest.actualShort'))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
