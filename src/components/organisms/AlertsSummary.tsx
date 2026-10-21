import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useAlerts } from '@/api/alerts'
import { AlertItem } from '@/components/molecules/AlertItem'

const SHOWN = 3

// Непрочитанные предупреждения на главной (pr-063): три свежих и ссылка на все
export function AlertsSummary() {
  const { t } = useTranslation()
  const { data } = useAlerts(true, 1, SHOWN)

  if (!data?.total) return null
  return (
    <section aria-labelledby="home-alerts" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="home-alerts" className="text-base font-semibold text-ink">
          {t('alerts.title')}
        </h2>
        <Link to="/alerts" className="text-sm text-accent underline">
          {t('alerts.showAll', { count: data.total })}
        </Link>
      </div>
      <ul className="flex flex-col gap-2">
        {data.items.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </ul>
    </section>
  )
}
