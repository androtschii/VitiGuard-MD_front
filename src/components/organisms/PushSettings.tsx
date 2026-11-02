import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { usePushState, useTogglePush } from '@/api/push'

// Push-уведомления на этом устройстве (pr-083): предупреждения приходят, даже
// когда приложение закрыто
export function PushSettings() {
  const { t } = useTranslation()
  const id = useId()
  const state = usePushState()
  const toggle = useTogglePush()

  if (state.isPending) {
    return <p className="text-sm text-ink-muted">{t('common.loading')}</p>
  }
  if (state.isError) {
    return <p className="text-sm text-danger">{t('push.loadError')}</p>
  }
  if (state.data !== 'on' && state.data !== 'off') {
    return <p className="text-sm text-ink-muted">{t(`push.${state.data}`)}</p>
  }

  const isOn = toggle.isPending ? toggle.variables : state.data === 'on'
  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={isOn}
          disabled={toggle.isPending}
          onChange={(event) => toggle.mutate(event.target.checked)}
          className="size-4 accent-brand-700"
        />
        {t('push.toggle')}
      </label>
      <p className="text-ink-muted">{t('push.hint')}</p>
      {toggle.isError && (
        <p role="alert" className="text-danger">
          {t('push.failed')}
        </p>
      )}
    </div>
  )
}
