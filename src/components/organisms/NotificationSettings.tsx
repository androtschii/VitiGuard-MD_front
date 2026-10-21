import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  type AlertLevel,
} from '@/api/users'

const OPTIONS: { value: AlertLevel; key: string }[] = [
  { value: 'high', key: 'high' },
  { value: 'medium', key: 'medium' },
  { value: null, key: 'off' },
]

// С какого уровня риска присылать предупреждения (pr-089, backend/pr-084).
// Выбор сохраняется сразу
export function NotificationSettings() {
  const { t } = useTranslation()
  const name = useId()
  const settings = useNotificationSettings()
  const update = useUpdateNotificationSettings()
  const current = update.isPending
    ? update.variables
    : settings.data?.alert_level

  if (settings.isPending) {
    return <p className="text-sm text-ink-muted">{t('common.loading')}</p>
  }
  if (settings.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('notifications.loadError')}
      </p>
    )
  }

  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="mb-1 text-ink-muted">
        {t('notifications.question')}
      </legend>
      {OPTIONS.map((option) => (
        <label key={option.key} className="flex items-start gap-2 text-ink">
          <input
            type="radio"
            name={name}
            checked={current === option.value}
            onChange={() => update.mutate(option.value)}
            className="mt-0.5 size-4 accent-brand-700"
          />
          <span>
            {t(`notifications.${option.key}`)}
            <span className="block text-xs text-ink-subtle">
              {t(`notifications.${option.key}Hint`)}
            </span>
          </span>
        </label>
      ))}
      <p aria-live="polite" className="min-h-5 text-xs">
        {update.isError ? (
          <span className="text-danger">{t('notifications.failed')}</span>
        ) : update.isSuccess ? (
          <span className="text-accent">{t('notifications.saved')}</span>
        ) : null}
      </p>
    </fieldset>
  )
}
