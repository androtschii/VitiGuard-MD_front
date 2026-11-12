import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { VineCheck } from '@/api/vine'
import { HistoryPage } from '@/pages/HistoryPage'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'

function check(id: string, overrides: Partial<VineCheck> = {}): VineCheck {
  return {
    id,
    created_at: '2026-11-10T09:30:00Z',
    updated_at: '2026-11-10T09:30:00Z',
    vineyard_id: 'vineyard-1',
    vineyard_name: 'Криково',
    model: 'vine_yolo11n',
    image_width: 1280,
    image_height: 720,
    trunks: 2,
    bunches: 5,
    detections: [
      { label: 'trunk', confidence: 0.81, box: [0.1, 0.6, 0.2, 1] },
      { label: 'bunch', confidence: 0.7, box: [0.5, 0.2, 0.6, 0.3] },
    ],
    ...overrides,
  }
}

function list(items: VineCheck[]) {
  return { items, total: items.length, page: 1, size: 12, pages: 1 }
}

function renderHistory() {
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/history']}>
      <HistoryPage />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

async function openVineTab(user: ReturnType<typeof userEvent.setup>) {
  const tabs = screen.getByRole('tablist', { name: 'Какие проверки показать' })
  await user.click(within(tabs).getByRole('tab', { name: 'Ряды лозы' }))
}

describe('История анализов ряда', () => {
  it('показывает фото ряда с рамками, счётчики и участок', async () => {
    server.use(
      http.get('/api/v1/vine-checks', () =>
        HttpResponse.json(
          list([check('v1'), check('v2', { vineyard_name: null })]),
        ),
      ),
      http.get('/api/v1/vine-checks/:id/image', () =>
        HttpResponse.arrayBuffer(new ArrayBuffer(8), {
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      ),
    )
    const user = renderHistory()

    await openVineTab(user)

    expect(await screen.findByText('2 проверки')).toBeVisible()
    expect(screen.getAllByText('Стволы: 2 · Грозди: 5')).toHaveLength(2)
    expect(screen.getByText('Криково')).toBeVisible()
    expect(screen.getByText('Без участка')).toBeVisible()
    expect((await screen.findAllByTestId('vine-box')).length).toBe(4)
    // Фильтры по болезни к рядам не относятся
    expect(screen.queryByLabelText('Болезнь')).toBeNull()

    // Назад к листьям
    await user.click(screen.getByRole('tab', { name: 'Листья' }))
    expect(screen.getByRole('tab', { name: 'Листья' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('удаляет анализ после подтверждения', async () => {
    let deleted = ''
    let items = [check('v1')]
    server.use(
      http.get('/api/v1/vine-checks', () => HttpResponse.json(list(items))),
      http.get('/api/v1/vine-checks/:id/image', () =>
        HttpResponse.json({ detail: 'нет' }, { status: 404 }),
      ),
      http.delete('/api/v1/vine-checks/:id', ({ params }) => {
        deleted = String(params.id)
        items = []
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = renderHistory()
    await openVineTab(user)

    await user.click(await screen.findByRole('button', { name: 'Удалить' }))
    await user.click(screen.getByRole('button', { name: 'Отмена' }))
    await user.click(screen.getByRole('button', { name: 'Удалить' }))
    await user.click(screen.getByRole('button', { name: /Удалить проверку/ }))

    expect(
      await screen.findByText('Сохранённых анализов ряда пока нет.'),
    ).toBeVisible()
    expect(deleted).toBe('v1')
  })

  it('сообщает, если удалить не удалось, и показывает ошибку загрузки', async () => {
    server.use(
      http.get('/api/v1/vine-checks', () =>
        HttpResponse.json(list([check('v1')])),
      ),
      http.delete('/api/v1/vine-checks/:id', () =>
        HttpResponse.json({ detail: 'Ошибка' }, { status: 500 }),
      ),
    )
    const user = renderHistory()
    await openVineTab(user)

    await user.click(await screen.findByRole('button', { name: 'Удалить' }))
    await user.click(screen.getByRole('button', { name: /Удалить проверку/ }))

    expect(await screen.findByRole('alert')).toBeVisible()
  })

  it('показывает ошибку загрузки списка', async () => {
    server.use(
      http.get('/api/v1/vine-checks', () =>
        HttpResponse.json({ detail: 'Сервер недоступен' }, { status: 500 }),
      ),
    )
    const user = renderHistory()
    await openVineTab(user)

    expect(await screen.findByRole('alert')).toBeVisible()
  })
})
