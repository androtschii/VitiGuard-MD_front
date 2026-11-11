import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/api/client'
import { useMe, useTelegramLink, useUnlinkTelegram } from '@/api/users'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useTelegramStore } from '@/lib/telegram'

// Пока пользователь нажимает «Start» в Telegram, профиль переспрашивается
// с этим шагом: привязка появится на сайте сама, без перезагрузки
export const LINK_POLL_MS = 3000

// Подключение Telegram-бота в профиле (pr-090): бот принимает фото на
// диагностику, присылает предупреждения, а мини-приложение открывается без
// пароля. Привязка — одноразовой ссылкой: переход открывает чат с ботом
export function TelegramConnect() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const me = useMe()
  const telegram = useTelegramStore((state) => state.webApp)
  const unlink = useUnlinkTelegram()
  const link = useTelegramLink()
  const linked = me.data?.telegram_linked ?? false
  const waiting = link.isSuccess && !linked

  useEffect(() => {
    if (!waiting) return
    const timer = window.setInterval(
      () => void queryClient.invalidateQueries({ queryKey: ['users', 'me'] }),
      LINK_POLL_MS,
    )
    // Ссылка одноразовая и живёт ограниченное время: дольше ждать нечего
    const stop = window.setTimeout(
      () => window.clearInterval(timer),
      link.data.expires_in * 1000,
    )
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(stop)
    }
  }, [waiting, link.data, queryClient])

  const connect = () => {
    // Вкладка открывается сразу по нажатию: открытую после ответа сервера
    // браузер принял бы за всплывающее окно и заблокировал
    const tab = telegram ? null : window.open('', '_blank')
    link.mutate(undefined, {
      onSuccess: ({ url }) => {
        if (telegram) telegram.openTelegramLink(url)
        else if (tab) tab.location.href = url
      },
      onError: () => tab?.close(),
    })
  }

  if (!me.data) return null

  if (linked) {
    return (
      <div className="flex flex-col items-start gap-2 text-sm">
        <p className="text-ink">{t('telegram.linked')}</p>
        <Button
          size="sm"
          variant="secondary"
          isLoading={unlink.isPending}
          onClick={() => {
            link.reset()
            unlink.mutate()
          }}
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
      {waiting && (
        <div aria-live="polite" className="flex flex-col gap-1">
          <p className="flex items-center gap-2 text-ink">
            <Spinner className="text-accent" />
            {t('telegram.waiting')}
          </p>
          <p className="text-ink-soft">
            {t('telegram.notOpened')}{' '}
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
        </div>
      )}
      {link.isError && (
        <p role="alert" className="text-danger">
          {notConfigured ? t('telegram.notConfigured') : link.error.message}
        </p>
      )}
    </div>
  )
}
