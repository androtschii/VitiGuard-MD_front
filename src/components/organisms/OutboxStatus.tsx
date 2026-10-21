import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutbox, useSyncOutbox } from '@/api/outbox'
import { Button } from '@/components/atoms/Button'
import { useOnlineStatus } from '@/lib/useOnlineStatus'

// Проверки, сделанные без сети (pr-076): сколько ждёт отправки, и отправка
// сама, как только сеть вернулась
export function OutboxStatus() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const { data: queued = [] } = useOutbox()
  const sync = useSyncOutbox()
  const count = queued.length
  const { mutate, reset, isIdle } = sync

  useEffect(() => {
    // Без сети прошлый итог больше не нужен, а после неё — новая попытка
    if (!isOnline) reset()
    else if (count > 0 && isIdle) mutate()
  }, [isOnline, count, isIdle, mutate, reset])

  // Очередь могла опустеть до отправки (её отправила другая вкладка):
  // тогда сообщать не о чем
  if (sync.isSuccess && sync.data.sent + sync.data.rejected > 0) {
    const { sent, rejected } = sync.data
    return (
      <p role="status" className={BAR}>
        {[
          sent > 0 && t('outbox.sent', { count: sent }),
          rejected > 0 && t('outbox.rejected', { count: rejected }),
        ]
          .filter(Boolean)
          .join(' ')}
      </p>
    )
  }
  if (count === 0) return null
  if (sync.isError)
    return (
      <div role="alert" className={`${BAR} flex flex-wrap items-center gap-2`}>
        {t('outbox.failed', { count })}
        <Button size="sm" variant="secondary" onClick={() => mutate()}>
          {t('outbox.retry')}
        </Button>
      </div>
    )
  return (
    <p role="status" className={BAR}>
      {sync.isPending
        ? t('outbox.sending', { count })
        : t('outbox.waiting', { count })}
    </p>
  )
}

const BAR = 'border-b border-line bg-muted/60 px-4 py-2 text-sm text-ink-soft'
