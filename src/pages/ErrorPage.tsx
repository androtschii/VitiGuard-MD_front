import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'

type ErrorPageProps = {
  onRetry: () => void
}

export function ErrorPage({ onRetry }: ErrorPageProps) {
  const { t } = useTranslation()
  return (
    <CenteredTemplate>
      <h1 className="text-2xl font-semibold text-stone-900">
        {t('errorPage.title')}
      </h1>
      <p className="max-w-md text-stone-600">{t('errorPage.text')}</p>
      <Button onClick={onRetry}>{t('errorPage.reload')}</Button>
    </CenteredTemplate>
  )
}
