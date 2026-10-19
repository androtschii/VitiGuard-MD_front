import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/atoms/Button'

// Сообщения Service Worker (pr-069): приложение сохранено для работы без
// сети или вышла новая версия. Новая версия ставится только по кнопке:
// перезагрузка посреди рисования участка потеряла бы контур
export function UpdatePrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh && !offlineReady) return null

  const close = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 left-4 z-50 flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 text-sm text-ink shadow-lg sm:left-auto sm:max-w-sm"
    >
      <p>{needRefresh ? t('pwa.updateReady') : t('pwa.offlineReady')}</p>
      <div className="flex justify-end gap-2">
        {needRefresh && (
          <Button size="sm" onClick={() => void updateServiceWorker(true)}>
            {t('pwa.reload')}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={close}>
          {needRefresh ? t('pwa.later') : t('pwa.ok')}
        </Button>
      </div>
    </div>
  )
}
