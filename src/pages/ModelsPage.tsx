import { useTranslation } from 'react-i18next'
import { useNavItems } from '@/app/navigation'
import { StatTile } from '@/components/molecules/StatTile'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'
import { MODEL_CARDS, MODEL_LIMITATIONS } from '@/lib/modelCards'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

// Страница «О моделях»: честная информация о качестве, архитектуре и ограничениях моделей
export function ModelsPage() {
  const { t, i18n } = useTranslation()
  const navItems = useNavItems()

  useDocumentTitle(t('models.title'))
  // Числа в модуле карточек записаны с запятой (ru, ro); для английского — точка
  const localize = (value: string) =>
    i18n.resolvedLanguage === 'en' ? value.replace(',', '.') : value

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <div className="flex max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {t('models.title')}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{t('models.intro')}</p>
        </div>

        <section
          aria-labelledby="models-limitations"
          className="rounded-lg border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-700/60 dark:bg-amber-950/30"
        >
          <h2
            id="models-limitations"
            className="flex items-center gap-2 text-base font-semibold text-amber-900 dark:text-amber-200"
          >
            {t('models.limitations.title')}
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-amber-900/90 dark:text-amber-200/90">
            {MODEL_LIMITATIONS.map((limitation) => (
              <li key={limitation.id}>{t(limitation.textKey)}</li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {MODEL_CARDS.map((card) => (
            <section
              key={card.id}
              aria-labelledby={`card-${card.id}`}
              className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2
                  id={`card-${card.id}`}
                  className="text-base font-semibold text-ink"
                >
                  {t(card.titleKey)}
                </h2>
                <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/80 dark:text-brand-300">
                  {card.badge}
                </span>
              </div>

              <p className="text-sm text-ink-muted">{t(card.purposeKey)}</p>

              <dl
                className={`grid gap-3 ${
                  card.metrics.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}
              >
                {card.metrics.map((metric, metricIdx) => (
                  <StatTile
                    key={metric.labelKey}
                    label={t(metric.labelKey)}
                    value={
                      metric.valueKey
                        ? t(metric.valueKey)
                        : localize(metric.value ?? '')
                    }
                    hint={metric.hintKey ? t(metric.hintKey) : undefined}
                    index={metricIdx}
                  />
                ))}
              </dl>

              <p className="text-sm leading-relaxed text-ink-soft">
                {t(card.explanationKey)}
              </p>

              {card.classes && (
                <div className="flex flex-col gap-2 border-t border-line/60 pt-3">
                  <span className="text-xs font-semibold text-ink-subtle uppercase">
                    {t('models.classesLabel')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {card.classes.map((diseaseClass) => (
                      <span
                        key={diseaseClass}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-ink"
                      >
                        {t(`diseases.${diseaseClass}`)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </DashboardTemplate>
  )
}
