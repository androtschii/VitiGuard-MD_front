import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCreateFieldNote,
  useDeleteFieldNote,
  useDeleteQueuedNote,
  useFieldNotes,
  useNotePhoto,
  useQueuedNotes,
} from '@/api/fieldNotes'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Textarea } from '@/components/atoms/Textarea'
import { DeleteButton } from '@/components/molecules/DeleteButton'
import { Field } from '@/components/molecules/Field'
import { Modal } from '@/components/organisms/Modal'
import { dayTime, localToday } from '@/lib/riskSeries'
import { useObjectUrl } from '@/lib/useObjectUrl'

type FieldNotesDialogProps = {
  vineyardId: string
  vineyardName: string
  open: boolean
  onClose: () => void
}

type Point = { latitude: number; longitude: number }

function NotePhoto({
  vineyardId,
  noteId,
  alt,
}: {
  vineyardId: string
  noteId: string
  alt: string
}) {
  const { data } = useNotePhoto(vineyardId, noteId)
  const url = useObjectUrl(data ?? null)

  if (!url) return <div className="size-20 shrink-0 rounded-md bg-muted" />
  return (
    <img
      src={url}
      alt={alt}
      className="size-20 shrink-0 rounded-md object-cover motion-safe:animate-rise"
    />
  )
}

function PointLink({ latitude, longitude }: Point) {
  const { t } = useTranslation()
  return (
    <a
      href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-accent underline"
    >
      {t('notes.onMap')}
    </a>
  )
}

export function FieldNotesDialog({
  vineyardId,
  vineyardName,
  open,
  onClose,
}: FieldNotesDialogProps) {
  const { t, i18n } = useTranslation()
  const today = localToday()
  const day = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const format = (value: string) => day.format(dayTime(value))

  const notes = useFieldNotes(vineyardId, open)
  const { data: queue = [] } = useQueuedNotes()
  const create = useCreateFieldNote(vineyardId)
  const remove = useDeleteFieldNote(vineyardId)
  const removeQueued = useDeleteQueuedNote()
  const queued = queue.filter((item) => item.vineyardId === vineyardId)

  const [text, setText] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [point, setPoint] = useState<Point | null>(null)
  const [pointFailed, setPointFailed] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const locate = () => {
    setPointFailed(false)
    if (!navigator.geolocation) {
      setPointFailed(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setPoint({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setPointFailed(true),
      { enableHighAccuracy: true, timeout: 15_000 },
    )
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim() && !photo) {
      setIsEmpty(true)
      return
    }
    setIsEmpty(false)
    create.mutate(
      {
        notedOn: today,
        text: text.trim(),
        latitude: point?.latitude ?? null,
        longitude: point?.longitude ?? null,
        photo,
      },
      {
        onSuccess: () => {
          setText('')
          setPhoto(null)
          setPoint(null)
          setFormKey((key) => key + 1)
        },
      },
    )
  }

  const items = notes.data ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('notes.title', { name: vineyardName })}
      description={t('notes.description')}
    >
      <div className="flex flex-col gap-5 text-sm">
        <form
          key={formKey}
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-3 rounded-lg border border-line bg-muted/30 p-3"
        >
          <Field
            label={t('notes.textLabel')}
            error={isEmpty ? t('notes.emptyError') : undefined}
          >
            {(control) => (
              <Textarea
                rows={3}
                maxLength={2000}
                value={text}
                placeholder={t('notes.textPlaceholder')}
                onChange={(event) => setText(event.target.value)}
                {...control}
              />
            )}
          </Field>
          <Field label={t('notes.photoLabel')}>
            {(control) => (
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
                {...control}
              />
            )}
          </Field>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={locate}
            >
              {t('notes.locate')}
            </Button>
            <span aria-live="polite" className="text-xs text-ink-muted">
              {point
                ? t('notes.located')
                : pointFailed
                  ? t('notes.locateFailed')
                  : ''}
            </span>
          </div>
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
            {t('notes.save')}
          </Button>
        </form>

        {remove.isError && (
          <p role="alert" className="text-danger">
            {remove.error.message}
          </p>
        )}

        <ul aria-live="polite" className="flex flex-col gap-2">
          {queued.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-line-strong p-3 motion-safe:animate-rise"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-accent">
                  {t('notes.waiting')} · {format(item.notedOn)}
                </p>
                <p className="break-words whitespace-pre-wrap text-ink">
                  {item.text || t('notes.photoOnly')}
                </p>
              </div>
              <DeleteButton
                aria-label={t('notes.deleteQueued')}
                onClick={() => removeQueued.mutate(item.id)}
              >
                {t('notes.delete')}
              </DeleteButton>
            </li>
          ))}
          {items.map((note, index) => (
            <li
              key={note.id}
              style={{ '--i': Math.min(index, 8) } as React.CSSProperties}
              className="stagger flex items-start gap-3 rounded-lg border border-line p-3 motion-safe:animate-rise"
            >
              {note.has_photo && (
                <NotePhoto
                  vineyardId={vineyardId}
                  noteId={note.id}
                  alt={t('notes.photoAlt', { date: format(note.noted_on) })}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-subtle">
                  {format(note.noted_on)}
                </p>
                {note.text && (
                  <p className="break-words whitespace-pre-wrap text-ink">
                    {note.text}
                  </p>
                )}
                {note.latitude !== null && note.longitude !== null && (
                  <PointLink
                    latitude={note.latitude}
                    longitude={note.longitude}
                  />
                )}
              </div>
              <DeleteButton
                aria-label={t('notes.deleteNote', {
                  date: format(note.noted_on),
                })}
                isLoading={remove.isPending && remove.variables === note.id}
                onClick={() => remove.mutate(note.id)}
              >
                {t('notes.delete')}
              </DeleteButton>
            </li>
          ))}
        </ul>

        {notes.isPending && open ? (
          <p className="text-ink-muted">{t('common.loading')}</p>
        ) : notes.isError ? (
          <p className="text-ink-muted">{t('notes.loadFailed')}</p>
        ) : (
          items.length === 0 &&
          queued.length === 0 && (
            <p className="text-ink-muted">{t('notes.empty')}</p>
          )
        )}
      </div>
    </Modal>
  )
}
