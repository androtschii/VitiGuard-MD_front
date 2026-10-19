import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
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
  afterEach(() => {
    vi.unstubAllGlobals()
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
