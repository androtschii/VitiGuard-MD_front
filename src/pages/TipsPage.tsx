import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DISEASES } from '@/api/diagnosis'
import { useNavItems } from '@/app/navigation'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

const card = 'rounded-lg border border-line bg-surface p-4 shadow-sm'

// Пункты раздела — ключи перевода: tips.<раздел>.items.<пункт>
const SECTIONS = {
  photo: ['one', 'light', 'close', 'both', 'gps'],
  risk: ['high', 'medium', 'low', 'forecast'],
  offline: ['model', 'map', 'install', 'sync'],
  safety: ['label', 'ppe', 'wind', 'wait'],
} as const

// Быстрые подсказки для работы в поле (pr-081). Страница — часть оболочки
// приложения и открывается без сети
export function TipsPage() {
  const { t } = useTranslation()
  const navItems = useNavItems()

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <div className="flex max-w-3xl flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">{t('tips.title')}</h1>
          <p className="text-sm text-ink-muted">{t('tips.intro')}</p>
        </div>

        {(Object.keys(SECTIONS) as (keyof typeof SECTIONS)[]).map((section) => (
          <section
            key={section}
            aria-labelledby={`tips-${section}`}
            className={card}
          >
            <h2
              id={`tips-${section}`}
              className="mb-2 text-base font-semibold text-ink"
            >
              {t(`tips.${section}.title`)}
            </h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-ink-soft">
              {SECTIONS[section].map((item) => (
                <li key={item}>{t(`tips.${section}.items.${item}`)}</li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="tips-diseases" className={card}>
          <h2
            id="tips-diseases"
            className="mb-2 text-base font-semibold text-ink"
          >
            {t('tips.diseases')}
          </h2>
          <dl className="flex flex-col gap-3 text-sm">
            {DISEASES.filter((disease) => disease !== 'healthy').map(
              (disease) => (
                <div key={disease}>
                  <dt className="font-medium text-ink">
                    {t(`diseases.${disease}`)}
                  </dt>
                  <dd className="text-ink-soft">
                    {t(`diseaseInfo.${disease}.symptoms`)}
                  </dd>
                </div>
              ),
            )}
          </dl>
          <p className="mt-3 text-sm">
            <Link to="/diagnosis" className="text-accent underline">
              {t('tips.check')}
            </Link>
          </p>
        </section>
      </div>
    </DashboardTemplate>
  )
}
