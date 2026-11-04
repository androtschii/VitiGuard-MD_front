import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useDiagnoses } from '@/api/diagnoses'
import { useTodayRisks } from '@/api/risks'
import { useTreatmentPlan } from '@/api/treatments'
import { useVineyards, type Vineyard } from '@/api/vineyards'
import { RiskBadge } from '@/components/molecules/RiskBadge'
import type { InfoDisease } from '@/lib/assistant'
import { dayTime } from '@/lib/riskSeries'

// Ответы помощника по данным хозяйства: те же запросы, что у карты, главной
// и истории, поэтому открытые страницы и помощник делят кэш
const HISTORY_LIMIT = 5
// План каждого участка — отдельный запрос: в ответе первые участки
const PLAN_VINEYARDS = 5

function useDay() {
  const { i18n } = useTranslation()
  const format = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
  return (day: string) => format.format(dayTime(day))
}

function AnswerLink({
  to,
  label,
  onLeave,
}: {
  to: string
  label: string
  onLeave: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onLeave}
      className="self-start text-sm font-medium text-accent underline"
    >
      {label}
    </Link>
  )
}

export function RiskAnswer({ onLeave }: { onLeave: () => void }) {
  const { t } = useTranslation()
  const vineyards = useVineyards()
  const risks = useTodayRisks()

  if (vineyards.isError || risks.isError)
    return <p role="alert">{t('assistant.risk.failed')}</p>
  if (!vineyards.data || !risks.data) return <p>{t('common.loading')}</p>
  if (vineyards.data.length === 0) return <p>{t('assistant.risk.empty')}</p>

  const today = new Map(risks.data.map((item) => [item.vineyard_id, item]))
  return (
    <div className="flex flex-col gap-2">
      <p>{t('assistant.risk.intro')}</p>
      <ul className="flex flex-col gap-2">
        {vineyards.data.map((vineyard) => {
          const levels = today.get(vineyard.id)
          return (
            <li key={vineyard.id} className="flex flex-col gap-1">
              <span className="font-medium">{vineyard.name}</span>
              {levels ? (
                <span className="flex flex-wrap gap-1">
                  <RiskBadge level={levels.downy} label={t('risk.downy')} />
                  <RiskBadge level={levels.powdery} label={t('risk.powdery')} />
                </span>
              ) : (
                <span className="text-xs text-ink-muted">
                  {t('assistant.risk.none')}
                </span>
              )}
            </li>
          )
        })}
      </ul>
      {today.size < vineyards.data.length && (
        <p className="text-xs text-ink-muted">{t('assistant.risk.noneHint')}</p>
      )}
      <AnswerLink to="/map" label={t('assistant.risk.map')} onLeave={onLeave} />
    </div>
  )
}

function VineyardPlan({ vineyard }: { vineyard: Vineyard }) {
  const { t } = useTranslation()
  const day = useDay()
  const plan = useTreatmentPlan(vineyard.id)

  return (
    <li className="flex flex-col gap-0.5">
      <span className="font-medium">{vineyard.name}</span>
      {plan.isError && (
        <span className="text-xs text-danger">
          {t('assistant.plan.failed')}
        </span>
      )}
      {plan.isPending && (
        <span className="text-xs text-ink-muted">{t('common.loading')}</span>
      )}
      {plan.data && (
        <ul className="flex flex-col gap-0.5 text-xs">
          {(['downy_mildew', 'powdery_mildew'] as const).map((disease) => {
            const until = plan.data.protected_until[disease]
            return (
              until && (
                <li key={disease} className="text-ink-muted">
                  {t('assistant.plan.protected', {
                    disease: t(
                      `assistant.plan.${disease === 'downy_mildew' ? 'downy' : 'powdery'}`,
                    ),
                    date: day(until),
                  })}
                </li>
              )
            )
          })}
          {plan.data.recommendations.length === 0 && (
            <li className="text-ink-muted">{t('assistant.plan.quiet')}</li>
          )}
          {plan.data.recommendations.map((item) => (
            <li key={`${item.action}-${item.disease}-${item.due_by}`}>
              <strong>
                {t('treatments.dueBy', { date: day(item.due_by) })}:
              </strong>{' '}
              {t(`treatments.actions.${item.action}`)}
              {item.fungicide &&
                ` (${t(`treatments.fungicideShort.${item.fungicide}`)})`}
              {' — '}
              {t(`treatments.reasons.${item.reason}`, {
                defaultValue: item.reason,
              })}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function PlanAnswer({ onLeave }: { onLeave: () => void }) {
  const { t } = useTranslation()
  const vineyards = useVineyards()

  if (vineyards.isError) return <p role="alert">{t('assistant.plan.failed')}</p>
  if (!vineyards.data) return <p>{t('common.loading')}</p>
  if (vineyards.data.length === 0) return <p>{t('assistant.risk.empty')}</p>

  const shown = vineyards.data.slice(0, PLAN_VINEYARDS)
  const more = vineyards.data.length - shown.length
  return (
    <div className="flex flex-col gap-2">
      <p>{t('assistant.plan.intro')}</p>
      <ul className="flex flex-col gap-2">
        {shown.map((vineyard) => (
          <VineyardPlan key={vineyard.id} vineyard={vineyard} />
        ))}
      </ul>
      {more > 0 && (
        <p className="text-xs text-ink-muted">
          {t('assistant.plan.more', { count: more })}
        </p>
      )}
      <p className="text-xs text-ink-muted">{t('diseaseInfo.note')}</p>
      <AnswerLink to="/map" label={t('assistant.risk.map')} onLeave={onLeave} />
    </div>
  )
}

export function HistoryAnswer({ onLeave }: { onLeave: () => void }) {
  const { t, i18n } = useTranslation()
  const checks = useDiagnoses({}, 1)
  const when = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
  })

  if (checks.isError) return <p role="alert">{t('assistant.history.failed')}</p>
  if (!checks.data) return <p>{t('common.loading')}</p>
  const items = checks.data.items.slice(0, HISTORY_LIMIT)
  if (items.length === 0) return <p>{t('assistant.history.empty')}</p>

  return (
    <div className="flex flex-col gap-2">
      <p>{t('assistant.history.intro')}</p>
      <ul className="flex flex-col gap-1">
        {items.map((check) => (
          <li key={check.id}>
            <span className="text-xs text-ink-muted">
              {when.format(new Date(check.created_at))}
              {check.vineyard_name && ` · ${check.vineyard_name}`}
            </span>
            <br />
            <strong>{t(`diseases.${check.disease}`)}</strong>,{' '}
            {percent.format(check.confidence)}
            {check.review &&
              ` (${t('assistant.history.expert', {
                disease: t(`diseases.${check.review.disease}`),
              })})`}
          </li>
        ))}
      </ul>
      <AnswerLink
        to="/history"
        label={t('assistant.history.open')}
        onLeave={onLeave}
      />
    </div>
  )
}

export function DiseaseAnswer({
  disease,
  onLeave,
}: {
  disease: InfoDisease | null
  onLeave: () => void
}) {
  const { t } = useTranslation()

  if (disease === null) return <p>{t('assistant.diseaseList')}</p>
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold">{t(`diseases.${disease}`)}</p>
      {(['symptoms', 'conditions', 'control'] as const).map((part) => (
        <p key={part}>
          <strong>{t(`diseaseInfo.${part}`)}.</strong>{' '}
          {t(`diseaseInfo.${disease}.${part}`)}
        </p>
      ))}
      <p className="text-xs text-ink-muted">{t('diseaseInfo.note')}</p>
      <AnswerLink
        to="/diagnosis"
        label={t('assistant.diseaseCheck')}
        onLeave={onLeave}
      />
    </div>
  )
}
