import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueuedNotes, useSyncNotes } from '@/api/fieldNotes'
import { useOnlineStatus } from '@/lib/useOnlineStatus'

// Заметки, сделанные без сети, уходят сами, как только сеть вернулась. Сообщает
// только о том, что сервер заметку не принял: остальное видно в окне заметок
export function NotesSync() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const { data: queued = [] } = useQueuedNotes()
  const { mutate, reset, isIdle, data } = useSyncNotes()
  const count = queued.length

  useEffect(() => {
    if (!isOnline) reset()
    else if (count > 0 && isIdle) mutate()
  }, [isOnline, count, isIdle, mutate, reset])

  if (!data?.rejected) return null
  return (
    <p
      role="status"
      className="border-b border-line bg-muted/60 px-4 py-2 text-sm text-ink-soft"
    >
      {t('notes.rejected', { count: data.rejected })}
    </p>
  )
}
