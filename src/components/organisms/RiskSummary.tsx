import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRisks } from '@/api/risks'
import { Button } from '@/components/atoms/Button'
import { RiskBadge } from '@/components/molecules/RiskBadge'
import { RiskDialog } from '@/components/organisms/RiskDialog'
import { dailyRisk, dayTime, localToday } from '@/lib/riskSeries'

type RiskSummaryProps = {
  vineyardId: string
  vineyardName: string
}

// Риск в карточке участка: уровни на сегодня (вне сезона — на последний день
// с оценкой) и кнопка окна с риском по дням
export function RiskSummary({ vineyardId, vineyardName }: RiskSummaryProps) {
  const { t, i18n } = useTranslation()
  const risks = useRisks(vineyardId)
  const [isOpen, setIsOpen] = useState(false)
  const today = localToday()
  const latest = dailyRisk(risks.data ?? [])
    .filter((item) => item.day <= today)
    .at(-1)
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })

  return (
    <section aria-label={t('risk.section')}>
      <h3 className="text-xs font-semibold text-ink-subtle uppercase">
        {t('risk.section')}
      </h3>
      {risks.isPending ? (
        <p className="text-ink-muted">{t('common.loading')}</p>
      ) : latest ? (
        <>
          {latest.day !== today && (
            <p className="text-ink-muted">
              {t('risk.lastDay', { date: date.format(dayTime(latest.day)) })}
            </p>
          )}
          <p className="mt-0.5 flex flex-wrap gap-1.5">
            <RiskBadge level={latest.downy} label={t('risk.downy')} />
            <RiskBadge level={latest.powdery} label={t('risk.powdery')} />
          </p>
        </>
      ) : (
        <p className="text-ink-muted">{t('risk.notCalculated')}</p>
      )}
      <Button
        size="sm"
        variant="secondary"
        className="mt-1.5"
        onClick={() => setIsOpen(true)}
      >
        {t('risk.open')}
      </Button>
      {isOpen && (
        <RiskDialog
          vineyardId={vineyardId}
          vineyardName={vineyardName}
          open
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  )
}
