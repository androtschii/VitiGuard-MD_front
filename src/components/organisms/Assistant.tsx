import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { nearestWineries, useWineries } from '@/api/wineries'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { matchTopic, type AssistantTopic } from '@/lib/assistant'
import { useMapStore } from '@/store/map'

const PESTS = [
  'downy',
  'powdery',
  'botrytis',
  'moth',
  'mites',
  'phylloxera',
] as const
const WINES = ['meat', 'fish', 'cheese', 'dessert', 'party'] as const
const TOPICS: AssistantTopic[] = ['spray', 'wine', 'buy']

// Без точки — сами винодельни, с точкой — всё ближайшее
const CHISINAU = { lat: 47.0105, lon: 28.8638 }

type Message =
  | { id: number; from: 'user'; text: string }
  | { id: number; from: 'bot'; topic: AssistantTopic | null }

function SprayAnswer() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      <p>{t('assistant.spray.intro')}</p>
      {PESTS.map((pest) => (
        <p key={pest}>
          <strong>{t(`assistant.pests.${pest}.name`)}.</strong>{' '}
          {t(`assistant.pests.${pest}.advice`)}
        </p>
      ))}
      <p className="text-xs text-ink-muted">{t('assistant.spray.note')}</p>
    </div>
  )
}

function WineAnswer() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      <p>{t('assistant.wine.intro')}</p>
      {WINES.map((wine) => (
        <p key={wine}>
          <strong>{t(`assistant.wines.${wine}.dish`)}:</strong>{' '}
          {t(`assistant.wines.${wine}.wine`)}
        </p>
      ))}
      <p className="text-xs text-ink-muted">{t('assistant.wine.note')}</p>
    </div>
  )
}

function BuyAnswer({ onLeave }: { onLeave: () => void }) {
  const { t, i18n } = useTranslation()
  const wineries = useWineries()
  const showOnMap = useMapStore((state) => state.setShowWineries)
  const [point, setPoint] = useState<{ lat: number; lon: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const km = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 0,
  })

  const locate = () => {
    setFailed(false)
    if (!navigator.geolocation) {
      setFailed(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPoint({ lat: coords.latitude, lon: coords.longitude }),
      () => setFailed(true),
      { timeout: 15_000 },
    )
  }

  const items = wineries.data ?? []
  const list = point
    ? nearestWineries(items, point)
    : nearestWineries(
        items.filter((item) => item.kind === 'winery'),
        CHISINAU,
      )

  return (
    <div className="flex flex-col gap-2">
      <p>{point ? t('assistant.buy.nearby') : t('assistant.buy.intro')}</p>
      {wineries.isError && (
        <p role="alert" className="text-danger">
          {t('assistant.buy.failed')}
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {list.map(({ winery, km: distance }) => (
          <li key={`${winery.name}-${winery.lat}`}>
            {winery.website ? (
              <a
                href={winery.website}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent underline"
              >
                {winery.name}
              </a>
            ) : (
              <span className="font-medium">{winery.name}</span>
            )}{' '}
            <span className="text-xs text-ink-muted">
              {t(`wineries.kinds.${winery.kind}`)}
              {point &&
                ` · ${t('assistant.buy.km', { value: km.format(distance) })}`}
            </span>
          </li>
        ))}
      </ul>
      {failed && <p className="text-xs">{t('assistant.buy.locateFailed')}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={locate}>
          {t('assistant.buy.locate')}
        </Button>
        <Link
          to="/map"
          className="inline-flex items-center text-sm font-medium text-accent underline"
          onClick={() => {
            showOnMap(true)
            onLeave()
          }}
        >
          {t('assistant.buy.map')}
        </Link>
      </div>
      <p className="text-xs text-ink-muted">{t('assistant.buy.source')}</p>
    </div>
  )
}

// Встроенный помощник: подсказывает, чем обрабатывать лозу, какое вино выбрать
// и где его купить. Ответы готовые, поэтому работает и без сети
export function Assistant() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Длинный ответ читают с начала, а не с последней строки
    const log = logRef.current
    const last = log?.lastElementChild
    if (log && last instanceof HTMLElement)
      log.scrollTop = last.offsetTop - log.offsetTop
  }, [messages])

  const ask = (text: string, topic: AssistantTopic | null) => {
    setMessages((current) => [
      ...current,
      { id: current.length, from: 'user', text },
      { id: current.length + 1, from: 'bot', topic },
    ])
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const text = question.trim()
    if (!text) return
    ask(
      text,
      matchTopic(text, {
        spray: t('assistant.keywords.spray'),
        wine: t('assistant.keywords.wine'),
        buy: t('assistant.keywords.buy'),
      }),
    )
    setQuestion('')
  }

  const close = () => setIsOpen(false)

  return (
    // Esc закрывает панель и с поля ввода, и с круглой кнопки
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="print:hidden"
      onKeyDown={(event) => {
        if (event.key === 'Escape') close()
      }}
    >
      {isOpen && (
        <section
          aria-label={t('assistant.title')}
          className="fixed right-4 bottom-36 z-30 flex max-h-[min(34rem,calc(100svh-12rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl motion-safe:animate-rise lg:bottom-20"
        >
          <header className="flex items-center justify-between bg-linear-to-br from-brand-700 to-brand-950 px-4 py-3 text-white">
            <h2 className="font-semibold">{t('assistant.title')}</h2>
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={close}
              className="rounded px-2 text-lg leading-none hover:bg-white/20"
            >
              ×
            </button>
          </header>
          <div
            ref={logRef}
            role="log"
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 text-sm text-ink"
          >
            <p className="rounded-xl rounded-tl-sm bg-muted px-3 py-2">
              {t('assistant.greeting')}
            </p>
            {messages.map((message) =>
              message.from === 'user' ? (
                <p
                  key={message.id}
                  className="self-end rounded-xl rounded-br-sm bg-brand-700 px-3 py-2 text-white motion-safe:animate-rise"
                >
                  {message.text}
                </p>
              ) : (
                <div
                  key={message.id}
                  className="rounded-xl rounded-tl-sm bg-muted px-3 py-2 motion-safe:animate-rise"
                >
                  {message.topic === 'spray' && <SprayAnswer />}
                  {message.topic === 'wine' && <WineAnswer />}
                  {message.topic === 'buy' && <BuyAnswer onLeave={close} />}
                  {message.topic === null && t('assistant.unknown')}
                </div>
              ),
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-line px-3 pt-2">
            {TOPICS.map((topic) => (
              <Button
                key={topic}
                size="sm"
                variant="secondary"
                onClick={() => ask(t(`assistant.chips.${topic}`), topic)}
              >
                {t(`assistant.chips.${topic}`)}
              </Button>
            ))}
          </div>
          <form onSubmit={submit} className="flex gap-2 p-3">
            <Input
              aria-label={t('assistant.inputLabel')}
              placeholder={t('assistant.placeholder')}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <Button type="submit" size="sm">
              {t('assistant.send')}
            </Button>
          </form>
        </section>
      )}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={t('assistant.open')}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-20 z-30 grid size-13 place-items-center rounded-full bg-linear-to-br from-brand-600 to-brand-900 text-white shadow-lg transition motion-safe:hover:scale-110 lg:bottom-4"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 5h16v11H9l-5 4zM9 10.5h.01M12 10.5h.01M15 10.5h.01" />
        </svg>
      </button>
    </div>
  )
}
