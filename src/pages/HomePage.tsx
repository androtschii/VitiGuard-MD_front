import { useLogout } from '@/api/auth'
import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { ApiStatus } from '@/components/organisms/ApiStatus'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'

export function HomePage() {
  const { mutate: logout, isPending } = useLogout()

  return (
    <CenteredTemplate>
      <Logo className="size-16" />
      <h1 className="text-4xl font-semibold text-emerald-800">VitiGuard MD</h1>
      <p className="max-w-md text-stone-600">
        Мониторинг здоровья виноградников Молдовы: диагностика болезней по фото
        листьев, спутниковые индексы и прогноз риска заражения.
      </p>
      <ApiStatus />
      <Button
        variant="secondary"
        isLoading={isPending}
        onClick={() => logout()}
      >
        Выйти
      </Button>
    </CenteredTemplate>
  )
}
