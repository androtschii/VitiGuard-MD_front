import { useTranslation } from 'react-i18next'
import type { Disease } from '@/api/diagnosis'

const SECTIONS = ['symptoms', 'conditions', 'control'] as const

type DiseaseInfoProps = {
  disease: Disease
}

// Справка по найденной болезни под результатом диагностики (pr-050):
// признаки, погода, при которой болезнь развивается, и меры борьбы
export function DiseaseInfo({ disease }: DiseaseInfoProps) {
  const { t } = useTranslation()

  return (
    <section
      aria-labelledby="disease-info"
      className="rounded-md border border-line bg-muted/40 p-3 text-sm"
    >
      <h3 id="disease-info" className="mb-2 font-semibold text-ink">
        {t('diseaseInfo.title')}
      </h3>
      <dl className="flex flex-col gap-2">
        {SECTIONS.map((section) => (
          <div key={section}>
            <dt className="font-medium text-ink-soft">
              {t(`diseaseInfo.${section}`)}
            </dt>
            <dd className="text-ink-muted">
              {t(`diseaseInfo.${disease}.${section}`)}
            </dd>
          </div>
        ))}
      </dl>
      {disease !== 'healthy' && (
        <p className="mt-2 text-xs text-ink-subtle">{t('diseaseInfo.note')}</p>
      )}
    </section>
  )
}
