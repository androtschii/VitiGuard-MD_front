import type { ReactNode } from 'react'

type CenteredTemplateProps = {
  children: ReactNode
}

export function CenteredTemplate({ children }: CenteredTemplateProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-stone-50 p-6 text-center">
      {children}
    </main>
  )
}
