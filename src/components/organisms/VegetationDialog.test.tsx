import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import type { VegetationObservation } from '@/api/vegetation'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { VegetationDialog } from './VegetationDialog'

const URL = '/api/v1/vineyards/vineyard-1/vegetation'
const index = (mean: number) => ({ mean, min: mean, max: mean, std: 0 })

const history: VegetationObservation[] = [
  {
    acquired_at: '2026-06-25T09:17:00Z',
    platform: 'sentinel-2a',
    scene_cloud_cover: 3.8,
    parcel_cloud_cover: 0,
    ndvi: index(0.7951),
    ndre: index(0.4504),
  },
  {
    acquired_at: '2026-06-28T09:07:00Z',
    platform: 'sentinel-2b',
    scene_cloud_cover: 22.5,
    parcel_cloud_cover: null,
    ndvi: null,
    ndre: null,
  },
]

function renderDialog(observations: VegetationObservation[] = history) {
  server.use(http.get(URL, () => HttpResponse.json(observations)))
  const onClose = vi.fn()
  renderWithQueryClient(
    <VegetationDialog
      vineyardId="vineyard-1"
      vineyardName="Криково"
      open
      onClose={onClose}
    />,
  )
  return { onClose, user: userEvent.setup() }
}

describe('VegetationDialog', () => {
  it('показывает сводку, график и таблицу значений', async () => {
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Динамика вегетации: Криково' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(
        /Последний NDVI 0,80 \(25 июн. 2026 г.\). Снимков без облаков: 1, закрыто облаками над участком: 1/,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /График NDVI и NDRE/ }),
    ).toBeVisible()
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1]).toHaveTextContent(/0,80\s*0,45\s*0 %/)
    expect(rows[2]).toHaveTextContent(/—\s*—\s*—/)
  })

  it('без индексов предлагает обновить', async () => {
    renderDialog([])

    expect(await screen.findByText(/Индексов пока нет/)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('запускает расчёт и сообщает, что график будет дополняться', async () => {
    let started = false
    server.use(
      http.post(`${URL}/refresh`, () => {
        started = true
        return HttpResponse.json({ task_id: 'task-1' }, { status: 202 })
      }),
    )
    const { user } = renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Обновить по новым снимкам' }),
    )

    expect(await screen.findByText(/Расчёт запущен/)).toBeInTheDocument()
    expect(started).toBe(true)
  })

  it('показывает причину, если расчёт не запустился', async () => {
    server.use(
      http.post(`${URL}/refresh`, () =>
        HttpResponse.json({ detail: 'Участок не найден' }, { status: 404 }),
      ),
    )
    const { user } = renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Обновить по новым снимкам' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Участок не найден',
    )
    expect(screen.queryByText(/Расчёт запущен/)).not.toBeInTheDocument()
  })

  it('показывает причину, если историю не удалось загрузить', async () => {
    server.use(
      http.get(URL, () =>
        HttpResponse.json({ detail: 'Сервер недоступен' }, { status: 503 }),
      ),
    )
    renderWithQueryClient(
      <VegetationDialog
        vineyardId="vineyard-1"
        vineyardName="Криково"
        open
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сервер недоступен',
    )
  })
})
