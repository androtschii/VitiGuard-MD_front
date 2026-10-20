import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'

// Печатная версия страницы: что прятать на бумаге, решают стили печати
export function PrintButton() {
  const { t } = useTranslation()

  return (
    <Button
      size="sm"
      variant="secondary"
      className="print:hidden"
      onClick={() => window.print()}
    >
      {t('print.button')}
    </Button>
  )
}
