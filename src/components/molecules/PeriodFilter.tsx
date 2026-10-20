import { useTranslation } from 'react-i18next'
import { Input } from '@/components/atoms/Input'
import { SegmentedControl } from '@/components/molecules/SegmentedControl'
import type { Period, PeriodKind } from '@/lib/period'

type PeriodFilterProps = {
  value: Period
  onChange: (period: Period) => void
}

const KINDS: PeriodKind[] = ['week', 'month', 'season', 'custom']

// Период графиков: неделя, месяц, сезон или свои даты «с» и «по»
export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-end gap-2">
      <SegmentedControl
        label={t('period.label')}
        options={KINDS.map((kind) => ({
          value: kind,
          label: t(`period.${kind}`),
        }))}
        value={value.kind}
        onChange={(kind) => onChange({ ...value, kind })}
      />
      {value.kind === 'custom' && (
        <div className="flex flex-wrap gap-2">
          <label className="flex flex-col gap-0.5 text-xs text-ink-muted">
            {t('period.from')}
            <Input
              type="date"
              value={value.from}
              max={value.to || undefined}
              onChange={(event) =>
                onChange({ ...value, from: event.target.value })
              }
              className="h-8 w-40"
            />
          </label>
          <label className="flex flex-col gap-0.5 text-xs text-ink-muted">
            {t('period.to')}
            <Input
              type="date"
              value={value.to}
              min={value.from || undefined}
              onChange={(event) =>
                onChange({ ...value, to: event.target.value })
              }
              className="h-8 w-40"
            />
          </label>
        </div>
      )}
    </div>
  )
}
