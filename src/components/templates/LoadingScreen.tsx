import { Spinner } from '@/components/atoms/Spinner'

export function LoadingScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-stone-50">
      <div role="status" className="flex items-center gap-3 text-stone-600">
        <Spinner className="size-6 text-emerald-700" />
        <span>Загрузка…</span>
      </div>
    </main>
  )
}
