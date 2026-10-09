import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import type { ReactNode } from 'react'
import { Logo } from '@/components/atoms/Logo'

type AuthTemplateProps = {
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthTemplate({ title, children, footer }: AuthTemplateProps) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-stone-50 p-6">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Logo className="size-12" />
        <p className="font-semibold text-emerald-800">VitiGuard MD</p>
      </div>
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="mb-5 text-xl font-semibold text-stone-900">{title}</h1>
        {children}
      </div>
      {footer && <p className="text-sm text-stone-600">{footer}</p>}
    </main>
  )
}
