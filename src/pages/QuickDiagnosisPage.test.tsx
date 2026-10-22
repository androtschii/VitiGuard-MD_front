import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTelegramStore } from '@/lib/telegram'
import { diagnosis } from '@/test/handlers'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { fakeTelegram } from '@/test/telegram'
import { QuickDiagnosisPage } from './QuickDiagnosisPage'

const leaf = new File(['leaf'], 'leaf.jpg', { type: 'image/jpeg' })

function renderPage() {
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/diagnosis/quick']}>
      <QuickDiagnosisPage />
    </MemoryRouter>,
  )
  return userEvent.setup()
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

afterEach(() => {
  useTelegramStore.setState({ webApp: null })
})

describe('QuickDiagnosisPage', () => {
  it('в браузере — своя кнопка, проверка сохраняется в историю', async () => {
    const requests = captureDiagnose()
    const user = renderPage()
    const analyze = screen.getByRole('button', { name: 'Определить болезнь' })
    expect(analyze).toBeDisabled()

    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)
    await user.click(analyze)

    expect(await screen.findByText('Проверка сохранена.')).toBeInTheDocument()
    expect(requests[0]?.get('save')).toBe('true')
    expect(
      screen.getByRole('link', { name: 'Открыть историю' }),
    ).toHaveAttribute('href', '/history')
    expect(analyze).toBeDisabled()
    expect(
      screen.getByRole('link', { name: 'Полная версия VitiGuard MD' }),
    ).toHaveAttribute('href', '/')
  })

  it('в Telegram анализ — кнопкой Telegram, ответ — вибрацией', async () => {
    // Ответ не мгновенный: кнопка успевает показать ожидание
    server.use(
      http.post('/api/v1/ai/diagnose', async () => {
        await delay(50)
        return HttpResponse.json(diagnosis)
      }),
    )
    const telegram = fakeTelegram()
    useTelegramStore.setState({ webApp: telegram })
    const user = renderPage()
    const main = telegram.MainButton

    expect(
      screen.queryByRole('button', { name: 'Определить болезнь' }),
    ).toBeNull()
    expect(main.setText).toHaveBeenCalledWith('Определить болезнь')
    expect(main.hide).toHaveBeenCalled()

    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)
    expect(main.show).toHaveBeenCalled()
    const click = vi.mocked(main.onClick).mock.calls[0]?.[0]
    act(() => click?.())

    expect(await screen.findByText('Проверка сохранена.')).toBeInTheDocument()
    expect(main.showProgress).toHaveBeenCalledWith(false)
    expect(main.hideProgress).toHaveBeenCalled()
    // Болезнь найдена — предупреждающая вибрация
    expect(telegram.HapticFeedback?.notificationOccurred).toHaveBeenCalledWith(
      'warning',
    )
  })

  it('здоровый лист — вибрация успеха', async () => {
    server.use(
      http.post('/api/v1/ai/diagnose', () =>
        HttpResponse.json({ ...diagnosis, disease: 'healthy' }),
      ),
    )
    const telegram = fakeTelegram()
    useTelegramStore.setState({ webApp: telegram })
    const user = renderPage()

    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)
    act(() => vi.mocked(telegram.MainButton.onClick).mock.calls[0]?.[0]())

    await screen.findByText('Проверка сохранена.')
    expect(telegram.HapticFeedback?.notificationOccurred).toHaveBeenCalledWith(
      'success',
    )
  })

  it('ошибка сервера — сообщение и вибрация ошибки', async () => {
    server.use(
      http.post('/api/v1/ai/diagnose', () =>
        HttpResponse.json(
          { detail: 'Модель диагностики не загружена на сервер' },
          { status: 503 },
        ),
      ),
    )
    const telegram = fakeTelegram()
    useTelegramStore.setState({ webApp: telegram })
    const user = renderPage()

    await user.upload(screen.getByLabelText('Выбрать фото листа'), leaf)
    act(() => vi.mocked(telegram.MainButton.onClick).mock.calls[0]?.[0]())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Модель диагностики не загружена',
    )
    expect(telegram.HapticFeedback?.notificationOccurred).toHaveBeenCalledWith(
      'error',
    )
  })

  it('без фото нажатие ничего не отправляет, уход — прячет кнопку', () => {
    const requests = captureDiagnose()
    const telegram = fakeTelegram()
    useTelegramStore.setState({ webApp: telegram })
    const { unmount } = renderWithQueryClient(
      <MemoryRouter>
        <QuickDiagnosisPage />
      </MemoryRouter>,
    )

    act(() => vi.mocked(telegram.MainButton.onClick).mock.calls[0]?.[0]())
    unmount()

    expect(requests).toEqual([])
    expect(telegram.MainButton.offClick).toHaveBeenCalled()
  })
})
