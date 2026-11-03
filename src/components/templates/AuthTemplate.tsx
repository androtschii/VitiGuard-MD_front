import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/molecules/ThemeSwitcher'
import type { ReactNode } from 'react'
import { Wordmark } from '@/components/atoms/Wordmark'

type AuthTemplateProps = {
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthTemplate({ title, children, footer }: AuthTemplateProps) {
  return (
    <main className="flex min-h-svh flex-col items-center bg-canvas p-4 sm:p-6">
      {/* Переключатели - отдельной строкой над логотипом, а не поверх страницы:
          на низком окне или с увеличением браузера они закрывали логотип */}
      <div className="flex w-full flex-wrap justify-end gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 py-6">
        <Wordmark size="lg" withTagline />
        <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6 shadow-sm motion-safe:animate-rise">
          <h1 className="mb-5 text-xl font-semibold text-ink">{title}</h1>
          {children}
        </div>
        {footer && <p className="text-sm text-ink-muted">{footer}</p>}
      </div>
    </main>
  )
}
