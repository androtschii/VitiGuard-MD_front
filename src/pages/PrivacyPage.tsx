import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/molecules/ThemeSwitcher'
import { Wordmark } from '@/components/atoms/Wordmark'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function PrivacyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useDocumentTitle(t('privacy.title'))

  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    void navigate(-1)
  }

  return (
    <main className="flex min-h-svh flex-col items-center bg-canvas p-4 sm:p-6">
      <div className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-2">
        <Link
          to=".."
          onClick={handleBack}
          className="hover:text-accent-hover inline-flex items-center gap-1.5 text-sm font-medium text-accent underline"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-4"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('common.back')}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

      <div className="my-6 flex w-full max-w-3xl flex-col items-center gap-6">
        <Wordmark size="lg" withTagline />
        <article className="w-full rounded-lg border border-line bg-surface p-6 shadow-sm motion-safe:animate-rise sm:p-8">
          <h1 className="text-2xl font-bold text-ink">{t('privacy.title')}</h1>
          <p className="mt-1 text-sm font-medium text-ink-muted">
            {t('privacy.lawNotice')}
          </p>

          <div className="mt-6 flex flex-col gap-6 text-sm text-ink-soft">
            <section aria-labelledby="privacy-sec-1">
              <h2 id="privacy-sec-1" className="font-semibold text-ink">
                {t('privacy.operator.title')}
              </h2>
              <p className="mt-1">{t('privacy.operator.text')}</p>
            </section>

            <section aria-labelledby="privacy-sec-2">
              <h2 id="privacy-sec-2" className="font-semibold text-ink">
                {t('privacy.dataTypes.title')}
              </h2>
              <p className="mt-1">{t('privacy.dataTypes.text')}</p>
            </section>

            <section aria-labelledby="privacy-sec-3">
              <h2 id="privacy-sec-3" className="font-semibold text-ink">
                {t('privacy.purposes.title')}
              </h2>
              <p className="mt-1">{t('privacy.purposes.text')}</p>
            </section>

            <section aria-labelledby="privacy-sec-4">
              <h2 id="privacy-sec-4" className="font-semibold text-ink">
                {t('privacy.access.title')}
              </h2>
              <p className="mt-1">{t('privacy.access.text')}</p>
            </section>

            <section aria-labelledby="privacy-sec-5">
              <h2 id="privacy-sec-5" className="font-semibold text-ink">
                {t('privacy.retention.title')}
              </h2>
              <p className="mt-1">{t('privacy.retention.text')}</p>
            </section>

            <section aria-labelledby="privacy-sec-6">
              <h2 id="privacy-sec-6" className="font-semibold text-ink">
                {t('privacy.rights.title')}
              </h2>
              <p className="mt-1">{t('privacy.rights.text')}</p>
            </section>

            <section aria-labelledby="privacy-sec-7">
              <h2 id="privacy-sec-7" className="font-semibold text-ink">
                {t('privacy.updatedAt.title')}
              </h2>
              <p className="mt-1">{t('privacy.updatedAt.text')}</p>
            </section>
          </div>
        </article>
      </div>
    </main>
  )
}
