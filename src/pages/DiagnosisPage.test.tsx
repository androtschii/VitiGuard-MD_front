import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { api } from '@/api/client'
import * as crop from '@/lib/crop'
import * as exifGps from '@/lib/exifGps'
import * as offline from '@/lib/offlineClassifier'
import { deleteModel, saveModel } from '@/lib/modelStore'
import { listQueued, removeQueued } from '@/lib/outbox'
import { diagnosis } from '@/test/handlers'
import { DiagnosisPage } from './DiagnosisPage'
import { sidebarLink } from '@/test/nav'

const leaf = new File(['leaf'], 'leaf.jpg', { type: 'image/jpeg' })

function renderPage() {
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/diagnosis']}>
      <DiagnosisPage />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

async function analyze(user: ReturnType<typeof userEvent.setup>) {
  await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)
  await user.click(screen.getByRole('button', { name: 'Определить болезнь' }))
}

describe('DiagnosisPage', () => {
  afterEach(async () => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    await deleteModel()
    for (const item of await listQueued()) await removeQueued(item.id)
  })

  async function goOffline(withModel: boolean) {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    if (withModel) {
      await saveModel({
        meta: {
          name: 'efficientnet_b0',
          classes: ['healthy'],
          image_size: 224,
          mean: [0.485, 0.456, 0.406],
          std: [0.229, 0.224, 0.225],
          version: '3f1c9a0b7d2e4f60',
          size_bytes: 16_036_543,
        },
        bytes: new ArrayBuffer(1),
      })
    }
  }

  function captureDiagnose() {
    const requests: URLSearchParams[] = []
    server.use(
      http.post('/api/v1/ai/diagnose', ({ request }) => {
        requests.push(new URL(request.url).searchParams)
        return HttpResponse.json({ ...diagnosis, id: 'saved-1' })
      }),
    )
    return requests
  }

  it('сохраняет проверку на участке, где снято фото', async () => {
    const requests = captureDiagnose()
    server.use(
      http.get('/api/v1/vineyards', () =>
        HttpResponse.json({
          items: [
            {
              id: 'vineyard-1',
              name: 'Криково',
              geometry: {
                type: 'MultiPolygon',
                coordinates: [
                  [
                    [
                      [28.86, 47.14],
                      [28.87, 47.14],
                      [28.87, 47.15],
                      [28.86, 47.15],
                      [28.86, 47.14],
                    ],
                  ],
                ],
              },
              area_ha: 1,
              variety: null,
              planting_year: null,
              created_at: '2026-06-01T00:00:00Z',
              updated_at: '2026-06-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          size: 100,
          pages: 1,
        }),
      ),
    )
    vi.spyOn(exifGps, 'readPhotoGps').mockResolvedValue({
      latitude: 47.145,
      longitude: 28.865,
    })
    const user = renderPage()
    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)

    // Участок подставлен по GPS из фото
    await waitFor(() =>
      expect(screen.getByLabelText('Участок')).toHaveValue('vineyard-1'),
    )
    await user.click(screen.getByRole('button', { name: 'Определить болезнь' }))

    await screen.findByText('Диагноз')
    expect(requests[0]?.get('save')).toBe('true')
    expect(requests[0]?.get('vineyard_id')).toBe('vineyard-1')
  })

  it('анализирует кадрированное фото, а участок берёт по GPS исходного', async () => {
    // jsdom не кладёт содержимое файла в multipart: отправленный файл видно
    // только в FormData, переданной клиенту API
    const post = vi.spyOn(api, 'post')
    const readGps = vi.spyOn(exifGps, 'readPhotoGps').mockResolvedValue({
      latitude: 47.145,
      longitude: 28.865,
    })
    const cropped = new File(['crop'], 'leaf-crop.jpg', { type: 'image/jpeg' })
    vi.spyOn(crop, 'cropPhoto').mockResolvedValue(cropped)
    const user = renderPage()
    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)
    await screen.findByText(/Снято в точке 47,145/)

    await user.click(screen.getByRole('button', { name: 'Кадрировать' }))
    const dialog = screen.getByRole('dialog', { name: 'Кадрирование фото' })
    const image = within(dialog).getByRole('img')
    Object.defineProperty(image, 'naturalWidth', { value: 800 })
    Object.defineProperty(image, 'naturalHeight', { value: 600 })
    fireEvent.load(image)
    await user.click(
      within(dialog).getByRole('button', { name: 'Кадрировать' }),
    )
    await user.click(screen.getByRole('button', { name: 'Определить болезнь' }))

    await screen.findByText('Диагноз')
    const [url, form] = post.mock.calls[0]
    expect(url).toBe('/ai/diagnose')
    expect((form as FormData).get('image')).toBe(cropped)
    // Координаты съёмки остались от исходного файла: в копии EXIF нет
    expect(screen.getByText(/Снято в точке 47,145/)).toBeInTheDocument()
    expect(readGps.mock.calls.map(([file]) => file)).not.toContain(cropped)
  })

  it('кадрирование отменяет результат прежнего анализа', async () => {
    vi.spyOn(crop, 'cropPhoto').mockResolvedValue(
      new File(['crop'], 'leaf-crop.jpg', { type: 'image/jpeg' }),
    )
    const user = renderPage()
    await analyze(user)
    await screen.findByText('Диагноз')

    await user.click(screen.getByRole('button', { name: 'Кадрировать' }))
    const dialog = screen.getByRole('dialog', { name: 'Кадрирование фото' })
    const image = within(dialog).getByRole('img')
    Object.defineProperty(image, 'naturalWidth', { value: 800 })
    Object.defineProperty(image, 'naturalHeight', { value: 600 })
    fireEvent.load(image)
    await user.click(
      within(dialog).getByRole('button', { name: 'Кадрировать' }),
    )

    expect(screen.queryByText('Диагноз')).not.toBeInTheDocument()
  })

  it('без галочки проверка не сохраняется, участок можно сменить', async () => {
    const requests = captureDiagnose()
    const user = renderPage()
    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Сохранить фото и результат в историю',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Определить болезнь' }))

    await screen.findByText('Диагноз')
    expect(requests[0]?.has('save')).toBe(false)
    expect(requests[0]?.has('vineyard_id')).toBe(false)
  })

  it('без сети и модели объясняет, почему анализ недоступен', async () => {
    await goOffline(false)
    const user = renderPage()

    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)

    expect(
      screen.getByRole('button', { name: 'Определить болезнь' }),
    ).toBeDisabled()
    expect(screen.getByText(/только скачанная модель/)).toBeInTheDocument()
  })

  it('без сети анализирует фото скачанной моделью на устройстве', async () => {
    await goOffline(true)
    const classify = vi
      .spyOn(offline, 'classifyOffline')
      .mockResolvedValue({ ...diagnosis, heatmap: null, lesion: null })
    const user = renderPage()
    await screen.findByText(/Модель на устройстве/)

    await analyze(user)

    expect(
      await screen.findByText(/Определено на устройстве/),
    ).toBeInTheDocument()
    expect(classify).toHaveBeenCalledWith(leaf)
    expect(screen.getByText('Оидиум', { selector: 'p' })).toBeInTheDocument()
  })

  it('без сети ставит проверку с сохранением в очередь', async () => {
    await goOffline(true)
    vi.spyOn(offline, 'classifyOffline').mockResolvedValue({
      ...diagnosis,
      heatmap: null,
      lesion: null,
    })
    const user = renderPage()
    await screen.findByText(/Модель на устройстве/)

    await analyze(user)

    expect(
      await screen.findByText(/Фото поставлено в очередь/),
    ).toBeInTheDocument()
    const [queued] = await listQueued()
    expect(queued).toMatchObject({
      name: 'leaf.jpg',
      type: 'image/jpeg',
      vineyardId: null,
      disease: 'powdery_mildew',
    })
    expect(new TextDecoder().decode(queued?.image)).toBe('leaf')
  })

  it('без сети и без галочки в очередь ничего не ставит', async () => {
    await goOffline(true)
    vi.spyOn(offline, 'classifyOffline').mockResolvedValue({
      ...diagnosis,
      heatmap: null,
      lesion: null,
    })
    const user = renderPage()
    await screen.findByText(/Модель на устройстве/)
    await user.click(screen.getByLabelText(/Сохранить фото/))

    await analyze(user)

    await screen.findByText(/Определено на устройстве/)
    expect(screen.queryByText(/Фото поставлено в очередь/)).toBeNull()
    expect(await listQueued()).toEqual([])
  })

  it('сообщает, если анализ на устройстве не удался', async () => {
    await goOffline(true)
    vi.spyOn(offline, 'classifyOffline').mockRejectedValue(new Error('wasm'))
    const user = renderPage()
    await screen.findByText(/Модель на устройстве/)

    await analyze(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось проанализировать фото на устройстве',
    )
  })

  it('раздел отмечен в навигации, анализ доступен после выбора фото', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Диагностика по фото листа' }),
    ).toBeInTheDocument()
    expect(sidebarLink('Диагностика')).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('button', { name: 'Определить болезнь' }),
    ).toBeDisabled()
    expect(
      screen.getByText('Здесь появится результат анализа.'),
    ).toBeInTheDocument()
  })

  it('отправляет фото и показывает диагноз', async () => {
    let contentType: string | null = null
    let topK: string | null = null
    server.use(
      http.post('/api/v1/ai/diagnose', ({ request }) => {
        topK = new URL(request.url).searchParams.get('top_k')
        contentType = request.headers.get('content-type')
        return HttpResponse.json({
          model: 'efficientnet_b0',
          disease: 'downy_mildew',
          confidence: 0.88,
          low_confidence: false,
          top: [{ disease: 'downy_mildew', probability: 0.88 }],
        })
      }),
    )
    const user = renderPage()

    await analyze(user)

    expect(
      await screen.findByText(/Уверенность модели: 88\s%/),
    ).toBeInTheDocument()
    expect(contentType).toMatch(/^multipart\/form-data/)
    expect(topK).toBe('6')
  })

  it('на узком экране прокручивает к результату', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({ matches: query.includes('max-width') })),
    )
    const user = renderPage()

    await analyze(user)

    await screen.findByText('Диагноз')
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('на широком экране не прокручивает', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    )
    const user = renderPage()

    await analyze(user)

    await screen.findByText('Диагноз')
    expect(scroll).not.toHaveBeenCalled()
  })

  it('пока идёт анализ, показывает индикатор', async () => {
    server.use(
      http.post('/api/v1/ai/diagnose', () => new Promise<never>(() => {})),
    )
    const user = renderPage()

    await analyze(user)

    expect(await screen.findByText('Анализируем фото…')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Определить болезнь' }),
    ).toHaveAttribute('aria-busy', 'true')
  })

  it('показывает причину отказа сервера', async () => {
    server.use(
      http.post('/api/v1/ai/diagnose', () =>
        HttpResponse.json(
          { detail: 'Модель диагностики не загружена на сервер' },
          { status: 503 },
        ),
      ),
    )
    const user = renderPage()

    await analyze(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Модель диагностики не загружена на сервер',
    )
  })

  it('новое фото убирает результат прежнего', async () => {
    const user = renderPage()

    await analyze(user)
    expect(
      await screen.findByText(/Уверенность модели: 93\s%/),
    ).toBeInTheDocument()

    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)

    expect(
      screen.queryByText(/Уверенность модели: 93\s%/),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Здесь появится результат анализа.'),
    ).toBeInTheDocument()
  })
})
