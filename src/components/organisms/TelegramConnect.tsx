import { useTranslation } from 'react-i18next'
import { ApiError } from '@/api/client'
import { useMe, useTelegramLink, useUnlinkTelegram } from '@/api/users'
import { Button } from '@/components/atoms/Button'
import { useTelegramStore } from '@/lib/telegram'

// Подключение Telegram-бота в профиле (pr-090): бот принимает фото на
// диагностику, присылает предупреждения, а мини-приложение открывается без
// пароля. Привязка — одноразовой ссылкой: переход открывает чат с ботом
export function TelegramConnect() {
  const { t } = useTranslation()
  const me = useMe()
  const telegram = useTelegramStore((state) => state.webApp)
  const unlink = useUnlinkTelegram()
  const link = useTelegramLink()

  const connect = () =>
    link.mutate(undefined, {
      // Внутри Telegram ссылка открывает чат с ботом сразу. В браузере окно
      // после запроса заблокировал бы фильтр всплывающих окон — ниже ссылка
      onSuccess: ({ url }) => telegram?.openTelegramLink(url),
    })

  if (!me.data) return null

  if (me.data.telegram_linked) {
    return (
      <div className="flex flex-col items-start gap-2 text-sm">
        <p className="text-ink">{t('telegram.linked')}</p>
        <Button
          size="sm"
          variant="secondary"
          isLoading={unlink.isPending}
          onClick={() => unlink.mutate()}
        >
          {t('telegram.unlink')}
        </Button>
      </div>
    )
  }

  const notConfigured =
    link.error instanceof ApiError && link.error.status === 503
  return (
    <div className="flex flex-col items-start gap-2 text-sm">
      <p className="text-ink-muted">{t('telegram.about')}</p>
      <Button size="sm" isLoading={link.isPending} onClick={connect}>
        {t('telegram.connect')}
      </Button>
      {link.isSuccess && (
        <p className="text-ink-soft">
          <a
            href={link.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline"
          >
            {t('telegram.open')}
          </a>{' '}
          {t('telegram.expires', {
            minutes: Math.round(link.data.expires_in / 60),
          })}
        </p>
      )}
      {link.isError && (
        <p role="alert" className="text-danger">
          {notConfigured ? t('telegram.notConfigured') : link.error.message}
        </p>
      )}
    </div>
  )
}
