import { onlineManager } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { enqueue, listQueued, removeQueued } from '@/lib/outbox'
import { diagnosis } from '@/test/handlers'
import { queuedLeaf } from '@/test/outboxData'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { OutboxStatus } from './OutboxStatus'

function setOnline(value: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value)
  act(() => {
    window.dispatchEvent(new Event(value ? 'online' : 'offline'))
  })
}

afterEach(async () => {
  // Событие offline переводит в «без сети» и общий onlineManager TanStack Query
  onlineManager.setOnline(true)
  for (const item of await listQueued()) await removeQueued(item.id)
})

describe('OutboxStatus', () => {
  it('пустая очередь ничего не показывает', async () => {
    const { container } = renderWithQueryClient(<OutboxStatus />)

    await act(() => Promise.resolve())
    expect(container).toBeEmptyDOMElement()
  })

  it('без сети показывает очередь, с сетью отправляет её в историю', async () => {
    await enqueue(queuedLeaf)
    await enqueue(queuedLeaf)
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    renderWithQueryClient(<OutboxStatus />)

    expect(await screen.findByRole('status')).toHaveTextContent(
      'В очереди 2 проверки без сети',
    )

    setOnline(true)

    expect(
      await screen.findByText(/2 проверки из очереди сохранены/),
    ).toBeInTheDocument()
    expect(await listQueued()).toEqual([])

    // Без сети итог прошлой отправки больше не показывается
    setOnline(false)
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
  })

  it('сообщает, сколько фото сервер не принял', async () => {
    let calls = 0
    server.use(
      http.post('/api/v1/ai/diagnose', () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json({ ...diagnosis, id: 'saved-1' })
          : HttpResponse.json({ detail: 'Не фото' }, { status: 415 })
      }),
    )
    await enqueue(queuedLeaf)
    await enqueue(queuedLeaf)
    renderWithQueryClient(<OutboxStatus />)

    expect(
      await screen.findByText(
        'Проверка из очереди сохранена в историю. Сервер не принял 1 фото — оно убрано из очереди.',
      ),
    ).toBeInTheDocument()
  })

  it('все фото отвергнуты: о сохранении не пишет', async () => {
    server.use(
      http.post('/api/v1/ai/diagnose', () =>
        HttpResponse.json({ detail: 'Не фото' }, { status: 415 }),
      ),
    )
    await enqueue(queuedLeaf)
    renderWithQueryClient(<OutboxStatus />)

    expect(
      await screen.findByText(
        'Сервер не принял 1 фото — оно убрано из очереди.',
      ),
    ).toBeInTheDocument()
  })

  it('при сбое предлагает отправить снова', async () => {
    let fail = true
    server.use(
      http.post('/api/v1/ai/diagnose', () =>
        fail
          ? HttpResponse.json({ detail: 'Сбой' }, { status: 503 })
          : HttpResponse.json({ ...diagnosis, id: 'saved-1' }),
      ),
    )
    await enqueue(queuedLeaf)
    const user = userEvent.setup()
    renderWithQueryClient(<OutboxStatus />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось отправить проверки из очереди (1)',
    )
    fail = false
    await user.click(screen.getByRole('button', { name: 'Отправить сейчас' }))

    expect(
      await screen.findByText('Проверка из очереди сохранена в историю.'),
    ).toBeInTheDocument()
  })
})
