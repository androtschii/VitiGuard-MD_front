import type { ReactNode } from 'react'
import { Footer } from '@/components/organisms/Footer'
import { Header } from '@/components/organisms/Header'
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
  return (
    <div className="flex min-h-svh flex-col bg-stone-50">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-30 focus:m-2 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm"
      >
        Перейти к содержимому
      </a>
      <Header actions={headerActions} />
      <div className="relative flex flex-1">
        <Sidebar items={navItems} />
        <main id="content" className="min-w-0 flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
