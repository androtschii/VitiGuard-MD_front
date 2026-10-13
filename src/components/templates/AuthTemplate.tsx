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
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-canvas p-6">
      <div className="absolute top-4 right-4 flex gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <Wordmark size="lg" withTagline />
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6 shadow-sm motion-safe:animate-rise">
        <h1 className="mb-5 text-xl font-semibold text-ink">{title}</h1>
        {children}
      </div>
      {footer && <p className="text-sm text-ink-muted">{footer}</p>}
    </main>
  )
}
