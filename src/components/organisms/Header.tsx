import type { ReactNode } from 'react'
import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { useUiStore } from '@/store/ui'

type HeaderProps = {
  actions?: ReactNode
}

export function Header({ actions }: HeaderProps) {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <header className="flex h-14 items-center gap-3 border-b border-stone-200 bg-white px-4">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Меню"
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar"
        onClick={toggleSidebar}
        className="lg:hidden"
      >
        ☰
      </Button>
      <a
        href="/"
        className="flex items-center gap-2 font-semibold text-emerald-800"
      >
        <Logo className="size-7" />
        VitiGuard MD
      </a>
      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </header>
  )
}
