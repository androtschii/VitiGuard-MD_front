import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/molecules/ThemeSwitcher'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { useUiStore } from '@/store/ui'

type HeaderProps = {
  actions?: ReactNode
}

export function Header({ actions }: HeaderProps) {
  const { t } = useTranslation()
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <header className="flex h-14 items-center gap-3 border-b border-line bg-surface px-4">
      <Button
        variant="ghost"
        size="sm"
        aria-label={t('common.menu')}
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar"
        onClick={toggleSidebar}
        className="lg:hidden"
      >
        ☰
      </Button>
      <Link
        to="/"
        className="flex items-center gap-2 font-semibold text-accent"
      >
        <Logo className="size-7" />
        VitiGuard MD
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
        {actions}
      </div>
    </header>
  )
}
