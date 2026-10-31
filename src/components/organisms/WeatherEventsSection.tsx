import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  EVENT_KINDS,
  useCreateWeatherEvent,
  useDeleteWeatherEvent,
  useWeatherEvents,
  type EventKind,
  type Severity,
} from '@/api/weatherEvents'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { DeleteButton } from '@/components/molecules/DeleteButton'
import { Field } from '@/components/molecules/Field'
import { dayTime, localToday } from '@/lib/riskSeries'

const SEVERITIES: Severity[] = [1, 2, 3]

// Журнал заморозков, града и других бед: видно рядом с фазами, в какой момент
// сезона случилась потеря
export function WeatherEventsSection({ vineyardId }: { vineyardId: string }) {
  const { t, i18n } = useTranslation()
  const today = localToday()
  const day = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })

  const events = useWeatherEvents(vineyardId)
  const create = useCreateWeatherEvent(vineyardId)
  const remove = useDeleteWeatherEvent(vineyardId)
  const [occurredOn, setOccurredOn] = useState(today)
  const [kind, setKind] = useState<EventKind>('frost')
  const [severity, setSeverity] = useState<Severity>(1)
  const [note, setNote] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    create.mutate(
      {
        occurred_on: occurredOn,
        kind,
        severity,
        note: note.trim() || null,
      },
      { onSuccess: () => setNote('') },
    )
  }

  const items = events.data ?? []

  return (
    <section
      aria-labelledby="weather-events-heading"
      className="flex flex-col gap-3 border-t border-line pt-4"
    >
      <h3 id="weather-events-heading" className="font-semibold text-ink">
        {t('weatherEvents.title')}
      </h3>
      <form
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-lg border border-line bg-muted/30 p-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label={t('weatherEvents.date')} required>
            {(control) => (
              <Input
                type="date"
                value={occurredOn}
                max={today}
                onChange={(event) => setOccurredOn(event.target.value)}
                required
                {...control}
              />
            )}
          </Field>
          <Field label={t('weatherEvents.kind')} required>
            {(control) => (
              <Select
                value={kind}
                onChange={(event) => setKind(event.target.value as EventKind)}
                {...control}
              >
                {EVENT_KINDS.map((value) => (
                  <option key={value} value={value}>
                    {t(`weatherEvents.kinds.${value}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t('weatherEvents.severity')} required>
            {(control) => (
              <Select
                value={severity}
                onChange={(event) =>
                  setSeverity(Number(event.target.value) as Severity)
                }
                {...control}
              >
                {SEVERITIES.map((value) => (
                  <option key={value} value={value}>
                    {t(`weatherEvents.severities.${value}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <Field label={t('weatherEvents.note')}>
          {(control) => (
            <Input
              value={note}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              {...control}
            />
          )}
        </Field>
        {create.isError && (
          <p role="alert" className="text-danger">
            {create.error.message}
          </p>
        )}
        <Button
          size="sm"
          type="submit"
          isLoading={create.isPending}
          className="self-start"
        >
          {t('weatherEvents.save')}
        </Button>
      </form>

      {remove.isError && (
        <p role="alert" className="text-danger">
          {remove.error.message}
        </p>
      )}
      {events.isPending ? (
        <p className="text-ink-muted">{t('common.loading')}</p>
      ) : events.isError ? (
        <p className="text-ink-muted">{t('weatherEvents.loadFailed')}</p>
      ) : items.length === 0 ? (
        <p className="text-ink-muted">{t('weatherEvents.empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-1.5"
            >
              <span className="min-w-0 text-ink">
                {day.format(dayTime(item.occurred_on))} ·{' '}
                {t(`weatherEvents.kinds.${item.kind}`)} ·{' '}
                {t(`weatherEvents.severities.${item.severity}`)}
                {item.note && (
                  <span className="block text-xs break-words text-ink-muted">
                    {item.note}
                  </span>
                )}
              </span>
              <DeleteButton
                aria-label={t('weatherEvents.deleteOne', {
                  date: day.format(dayTime(item.occurred_on)),
                })}
                isLoading={remove.isPending && remove.variables === item.id}
                onClick={() => remove.mutate(item.id)}
              >
                {t('weatherEvents.delete')}
              </DeleteButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
