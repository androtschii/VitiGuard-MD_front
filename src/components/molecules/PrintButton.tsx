import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/cn'

// Печатная версия страницы: что прятать на бумаге, решают стили печати
export function PrintButton({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <Button
      size="sm"
      variant="secondary"
      className={cn('print:hidden', className)}
      onClick={() => window.print()}
    >
      {t('print.button')}
    </Button>
  )
}
