import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/molecules/ThemeSwitcher'
import { Wordmark } from '@/components/atoms/Wordmark'
import { DemoLogin } from '@/components/organisms/DemoLogin'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function WelcomePage() {
  const { t } = useTranslation()

  useDocumentTitle()

  return (
    <main className="flex min-h-svh flex-col items-center bg-canvas p-4 sm:p-6">
      <header className="flex w-full max-w-4xl items-center justify-between gap-4">
        <Wordmark size="sm" />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <div className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-6 text-center motion-safe:animate-rise sm:py-10">
        <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-ink sm:text-4xl">
          {t('welcome.title')}
        </h1>
        <p className="mt-3 max-w-xl text-base text-ink-muted sm:text-lg">
          {t('welcome.description')}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="fill-hover inline-flex h-11 items-center justify-center rounded-md bg-brand-700 px-6 text-base font-semibold text-white shadow-sm transition [--fill:var(--color-brand-900)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-px"
          >
            {t('welcome.login')}
          </Link>
          <Link
            to="/register"
            className="fill-hover inline-flex h-11 items-center justify-center rounded-md border border-line-strong bg-surface px-6 text-base font-medium text-ink shadow-sm transition hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-px"
          >
            {t('welcome.register')}
          </Link>
        </div>

        <div className="mt-10 grid w-full gap-4 text-left sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19l8-8" />
              </svg>
            </div>
            <p className="text-sm text-ink">
              {t('welcome.features.diagnosis')}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <p className="text-sm text-ink">{t('welcome.features.alerts')}</p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14" />
              </svg>
            </div>
            <p className="text-sm text-ink">{t('welcome.features.map')}</p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-5"
              >
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <p className="text-sm text-ink">{t('welcome.features.offline')}</p>
          </div>
        </div>

        <div className="mt-8 w-full max-w-md">
          <DemoLogin />
        </div>
      </div>

      <footer className="mt-8 w-full max-w-4xl border-t border-line pt-4 text-center">
        <Link
          to="/privacy"
          className="text-xs text-ink-muted underline hover:text-ink"
        >
          {t('privacy.title')}
        </Link>
      </footer>
    </main>
  )
}
