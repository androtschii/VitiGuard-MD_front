import { Button } from '@/components/atoms/Button'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'

type ErrorPageProps = {
  onRetry: () => void
}

export function ErrorPage({ onRetry }: ErrorPageProps) {
  return (
    <CenteredTemplate>
      <h1 className="text-2xl font-semibold text-stone-900">
        Что-то пошло не так
      </h1>
      <p className="max-w-md text-stone-600">
        На странице произошла ошибка. Попробуйте обновить её — если ошибка
        повторится, сообщите нам.
      </p>
      <Button onClick={onRetry}>Обновить страницу</Button>
    </CenteredTemplate>
  )
}
