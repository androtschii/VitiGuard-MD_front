import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  enqueueNote,
  listQueuedNotes,
  removeQueuedNote,
} from '@/lib/noteOutbox'
import { api } from '@/api/client'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { FieldNotesDialog } from './FieldNotesDialog'
import { NotesSync } from './NotesSync'

const URL_NOTES = '/api/v1/vineyards/plot-1/notes'
const note = {
  id: 'n1',
  vineyard_id: 'plot-1',
  noted_on: '2026-06-10',
  text: 'Пятна на листьях',
  latitude: 47.1,
  longitude: 28.8,
  has_photo: true,
  created_at: '2026-06-10T00:00:00Z',
  updated_at: '2026-06-10T00:00:00Z',
}
const queued = {
  clientId: 'c1',
  vineyardId: 'plot-1',
  notedOn: '2026-06-11',
  text: 'Без сети',
  latitude: null,
  longitude: null,
  photo: null,
  photoName: null,
  photoType: null,
}

function serve(items: unknown[] = [note]) {
  server.use(
    http.get(URL_NOTES, () => HttpResponse.json(items)),
    http.get(`${URL_NOTES}/n1/photo`, () =>
      HttpResponse.arrayBuffer(new ArrayBuffer(4), {
        headers: { 'Content-Type': 'image/png' },
      }),
    ),
  )
}

function renderDialog() {
  return renderWithQueryClient(
    <FieldNotesDialog
      vineyardId="plot-1"
      vineyardName="Криково"
      open
      onClose={() => {}}
    />,
  )
}

function setOnline(value: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value)
}

describe('FieldNotesDialog', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '')
    })
    URL.createObjectURL = vi.fn(() => 'blob:photo')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    for (const item of await listQueuedNotes()) await removeQueuedNote(item.id)
  })

  it('показывает заметку с фото и ссылкой на точку и удаляет её', async () => {
    serve()
    let deleted = false
    server.use(
      http.delete(`${URL_NOTES}/n1`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderDialog()

    expect(await screen.findByText('Пятна на листьях')).toBeInTheDocument()
    expect(await screen.findByRole('img', { hidden: true })).toHaveAttribute(
      'src',
      'blob:photo',
    )
    expect(
      screen.getByRole('link', { name: 'На карте', hidden: true }),
    ).toHaveAttribute('href', expect.stringContaining('mlat=47.1'))

    await userEvent.click(
      screen.getByRole('button', { name: /Удалить заметку/, hidden: true }),
    )
    await waitFor(() => expect(deleted).toBe(true))
  })

  it('пустую заметку не отправляет', async () => {
    serve([])
    renderDialog()
    await screen.findByText('Заметок пока нет.')

    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить заметку', hidden: true }),
    )

    expect(screen.getByText('Напишите текст или добавьте фото')).toBeVisible()
  })

  it('отправляет текст, фото и точку', async () => {
    serve([])
    server.use(
      http.post(URL_NOTES, () => HttpResponse.json(note, { status: 201 })),
    )
    const post = vi.spyOn(api, 'post')
    vi.stubGlobal('navigator', {
      ...navigator,
      onLine: true,
      geolocation: {
        getCurrentPosition: (ok: PositionCallback) =>
          ok({
            coords: { latitude: 47.2, longitude: 28.9 },
          } as GeolocationPosition),
      },
    })
    renderDialog()
    await screen.findByText('Заметок пока нет.')

    await userEvent.type(screen.getByLabelText('Что заметили'), ' Пятна ')
    await userEvent.upload(
      screen.getByLabelText('Фото'),
      new File(['leaf'], 'leaf.png', { type: 'image/png' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Отметить мою точку', hidden: true }),
    )
    expect(await screen.findByText('Точка отмечена')).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить заметку', hidden: true }),
    )

    await waitFor(() => expect(post).toHaveBeenCalled())
    const form = post.mock.calls[0]?.[1] as FormData
    expect(form?.get('text')).toBe('Пятна')
    expect(form?.get('latitude')).toBe('47.2')
    expect((form?.get('photo') as File).name).toBe('leaf.png')
    expect(form?.get('client_id')).toBeTruthy()
  })

  it('сообщает, что точку определить не удалось', async () => {
    serve([])
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (_: unknown, fail: () => void) => fail(),
      },
    })
    renderDialog()
    await screen.findByText('Заметок пока нет.')

    await userEvent.click(
      screen.getByRole('button', { name: 'Отметить мою точку', hidden: true }),
    )

    expect(await screen.findByText('Не удалось определить точку')).toBeVisible()
  })

  it('без геолокации в браузере тоже сообщает о неудаче', async () => {
    serve([])
    vi.stubGlobal('navigator', { ...navigator, geolocation: undefined })
    renderDialog()
    await screen.findByText('Заметок пока нет.')

    await userEvent.click(
      screen.getByRole('button', { name: 'Отметить мою точку', hidden: true }),
    )

    expect(await screen.findByText('Не удалось определить точку')).toBeVisible()
  })

  it('без сети кладёт заметку в очередь и даёт её убрать', async () => {
    serve([])
    setOnline(false)
    renderDialog()
    await screen.findByText('Заметок пока нет.')

    await userEvent.type(screen.getByLabelText('Что заметили'), 'В поле')
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить заметку', hidden: true }),
    )

    expect(await screen.findByText(/Ждёт сети/)).toBeInTheDocument()
    expect(screen.getByText('В поле')).toBeInTheDocument()
    expect(await listQueuedNotes()).toHaveLength(1)

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Убрать заметку из очереди',
        hidden: true,
      }),
    )
    await waitFor(async () => expect(await listQueuedNotes()).toHaveLength(0))
  })

  it('ошибку сервера показывает, а не прячет в очередь', async () => {
    serve([])
    server.use(
      http.post(URL_NOTES, () =>
        HttpResponse.json({ detail: 'Плохое фото' }, { status: 400 }),
      ),
    )
    setOnline(true)
    renderDialog()
    await screen.findByText('Заметок пока нет.')

    await userEvent.type(screen.getByLabelText('Что заметили'), 'Текст')
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить заметку', hidden: true }),
    )

    expect(await screen.findByRole('alert', { hidden: true })).toBeVisible()
    expect(await listQueuedNotes()).toHaveLength(0)
  })

  it('сообщает, что заметки не загрузились', async () => {
    server.use(
      http.get(URL_NOTES, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 400 }),
      ),
    )
    renderDialog()

    expect(
      await screen.findByText('Не удалось загрузить заметки.'),
    ).toBeInTheDocument()
  })
})

describe('NotesSync', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    for (const item of await listQueuedNotes()) await removeQueuedNote(item.id)
  })

  it('с сетью отправляет очередь без лишних сообщений', async () => {
    setOnline(true)
    server.use(
      http.post(URL_NOTES, () => HttpResponse.json(note, { status: 201 })),
    )
    const post = vi.spyOn(api, 'post')
    await enqueueNote({
      ...queued,
      latitude: 47,
      longitude: 28,
      photo: new ArrayBuffer(2),
      photoName: 'a.png',
      photoType: 'image/png',
    })
    await enqueueNote(queued)

    renderWithQueryClient(<NotesSync />)

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    const first = post.mock.calls[0]?.[1] as FormData
    expect(first.get('client_id')).toBe('c1')
    expect(first.get('latitude')).toBe('47')
    expect((first.get('photo') as File).name).toBe('a.png')
    await waitFor(async () => expect(await listQueuedNotes()).toHaveLength(0))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('об отвергнутой заметке сообщает', async () => {
    setOnline(true)
    server.use(
      http.post(URL_NOTES, () =>
        HttpResponse.json({ detail: 'нет' }, { status: 404 }),
      ),
    )
    await enqueueNote(queued)

    renderWithQueryClient(<NotesSync />)

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Сервер не принял',
    )
  })

  it('при сбое сервера заметка остаётся в очереди', async () => {
    setOnline(true)
    server.use(
      http.post(URL_NOTES, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    await enqueueNote(queued)

    renderWithQueryClient(<NotesSync />)

    await waitFor(async () => {
      expect(await listQueuedNotes()).toHaveLength(1)
    })
  })

  it('без сети ничего не отправляет', async () => {
    setOnline(false)
    await enqueueNote(queued)

    renderWithQueryClient(<NotesSync />)

    await waitFor(async () => expect(await listQueuedNotes()).toHaveLength(1))
  })
})
