import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { AlertsBell } from '@/components/molecules/AlertsBell'
import { OfflineBanner } from '@/components/molecules/OfflineBanner'
import { BottomNav } from '@/components/organisms/BottomNav'
import { Footer } from '@/components/organisms/Footer'
import { Header } from '@/components/organisms/Header'
import { NotesSync } from '@/components/organisms/NotesSync'
import { OutboxStatus } from '@/components/organisms/OutboxStatus'
import { Sidebar, type NavItem } from '@/components/organisms/Sidebar'

type DashboardTemplateProps = {
  navItems: NavItem[]
  headerActions?: ReactNode
  children: ReactNode
}

export function DashboardTemplate({
  navItems,
  headerActions,
  children,
}: DashboardTemplateProps) {
  const { t, i18n } = useTranslation()
  const printed = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date())

  return (
    <div className="flex min-h-svh flex-col bg-canvas pb-16 lg:pb-0 print:min-h-0 print:pb-0">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-30 focus:m-2 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm print:hidden"
      >
        {t('common.skipToContent')}
      </a>
      {/* На бумаге навигация не нужна: остаётся содержимое страницы */}
      <div className="contents print:hidden">
        {/* Колокольчик предупреждений — на всех страницах кабинета (pr-063) */}
        <Header
          actions={
            <>
              <AlertsBell />
              {headerActions}
            </>
          }
        />
        <OfflineBanner />
        <OutboxStatus />
        <NotesSync />
      </div>
      <div className="relative flex flex-1">
        <div className="contents print:hidden">
          <Sidebar items={navItems} />
        </div>
        <main
          id="content"
          className="min-w-0 flex-1 p-4 motion-safe:animate-rise lg:p-6 print:p-0"
        >
          <p className="mb-4 hidden border-b border-line pb-2 text-xs text-ink-muted print:block">
            {t('print.header', { date: printed })}
          </p>
          {children}
        </main>
      </div>
      <div className="contents print:hidden">
        <Footer />
        <BottomNav items={navItems} />
      </div>
    </div>
  )
}
