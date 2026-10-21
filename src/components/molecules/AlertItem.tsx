import { useTranslation } from 'react-i18next'
import { useReadAlert, type Alert } from '@/api/alerts'
import { Button } from '@/components/atoms/Button'
import { RiskBadge } from '@/components/molecules/RiskBadge'
import { cn } from '@/lib/cn'
import { dayTime, localToday } from '@/lib/riskSeries'

type AlertItemProps = {
  alert: Alert
}

// Одно предупреждение: болезнь, участок, день и уровень (pr-063, pr-064)
export function AlertItem({ alert }: AlertItemProps) {
  const { t, i18n } = useTranslation()
  const read = useReadAlert()
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
  const today = localToday()
  const day =
    alert.day === today
      ? t('alerts.today')
      : dayTime(alert.day) - dayTime(today) === 86_400_000
        ? t('alerts.tomorrow')
        : date.format(dayTime(alert.day))
  const isUnread = alert.read_at === null

  return (
    <li
      className={cn(
        'flex flex-wrap items-start justify-between gap-2 rounded-md border p-3 text-sm',
        isUnread ? 'border-line-strong bg-surface' : 'border-line bg-muted/40',
      )}
    >
      <div className="flex flex-col gap-1">
        <p className={cn('text-ink', isUnread && 'font-medium')}>
          {t('alerts.text', {
            disease: t(
              alert.disease === 'downy_mildew' ? 'risk.downy' : 'risk.powdery',
            ),
            plot: alert.vineyard_name,
          })}
        </p>
        <p className="flex flex-wrap items-center gap-2 text-ink-muted">
          <RiskBadge level={alert.level} />
          <span>{day}</span>
          {alert.forecast && (
            <span className="text-xs text-ink-subtle">
              {t('alerts.forecast')}
            </span>
          )}
        </p>
      </div>
      {isUnread && (
        <Button
          size="sm"
          variant="secondary"
          isLoading={read.isPending}
          onClick={() => read.mutate(alert.id)}
        >
          {t('alerts.markRead')}
        </Button>
      )}
    </li>
  )
}
