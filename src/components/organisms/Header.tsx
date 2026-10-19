import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/molecules/ThemeSwitcher'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Wordmark } from '@/components/atoms/Wordmark'

type HeaderProps = {
  actions?: ReactNode
}

export function Header({ actions }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-line bg-surface px-4">
      <Link to="/" aria-label="VitiGuard MD" className="flex items-center">
        <Wordmark />
      </Link>
      <div className="ml-auto flex items-center gap-2">
        {/* На телефоне места под выпадающие списки нет: язык и тема — в профиле */}
        <div className="hidden items-center gap-2 sm:flex">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        {actions}
      </div>
    </header>
  )
}
