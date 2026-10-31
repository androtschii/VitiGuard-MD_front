import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { HarvestDialog } from './HarvestDialog'

const URL_HARVESTS = '/api/v1/vineyards/plot-1/harvests'
const record = {
  id: 'h1',
  vineyard_id: 'plot-1',
  season: 2025,
  estimated_kg: 1000,
  actual_kg: 800,
  sugar_brix: 22.5,
  created_at: '2025-09-01T00:00:00Z',
  updated_at: '2025-09-01T00:00:00Z',
}

function serve(items: unknown[]) {
  server.use(http.get(URL_HARVESTS, () => HttpResponse.json(items)))
}

function renderDialog(areaHa = 2) {
  return renderWithQueryClient(
    <HarvestDialog
      vineyardId="plot-1"
      vineyardName="Криково"
      areaHa={areaHa}
      open
      onClose={() => {}}
    />,
  )
}

const click = (name: string | RegExp) =>
  userEvent.click(screen.getByRole('button', { name, hidden: true }))

describe('HarvestDialog', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '')
    })
  })

  it('показывает прогноз, факт, урожайность и удаляет запись', async () => {
    serve([record])
    let deleted = false
    server.use(
      http.delete(`${URL_HARVESTS}/h1`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderDialog()

    expect(await screen.findByText(/1\s000 кг · 0,5 т\/га/)).toBeInTheDocument()
    expect(screen.getByText(/800 кг · 0,4 т\/га/)).toBeInTheDocument()
    expect(screen.getByText(/22,5 °Brix/)).toBeInTheDocument()

    await click('Удалить урожай 2025')
    await waitFor(() => expect(deleted).toBe(true))
  })

  it('запись только с фактом и участок без площади не ломаются', async () => {
    serve([{ ...record, estimated_kg: null, sugar_brix: null }])
    renderDialog(0)

    expect(await screen.findByText(/800 кг · 0 т\/га/)).toBeInTheDocument()
    expect(screen.queryByText('Прогноз')).toBeNull()
  })

  it('считает прогноз по гроздям и подставляет его', async () => {
    serve([])
    let body: unknown
    server.use(
      http.post(URL_HARVESTS, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(record, { status: 201 })
      }),
    )
    renderDialog()
    await screen.findByText('Записей пока нет.')

    await userEvent.type(screen.getByLabelText('Кустов на участке'), '1000')
    await userEvent.type(screen.getByLabelText('Гроздей на кусте'), '20')
    expect(screen.queryByText(/По подсчёту/)).toBeNull()
    await userEvent.type(screen.getByLabelText('Вес грозди, г'), '150')
    expect(screen.getByText(/По подсчёту: 3\s000 кг/)).toBeInTheDocument()

    await click('Подставить в прогноз')
    await userEvent.clear(screen.getByLabelText(/Сезон/))
    await userEvent.type(screen.getByLabelText(/Сезон/), '2024')
    await userEvent.type(screen.getByLabelText('Факт, кг'), '2800')
    await userEvent.type(screen.getByLabelText('Сахар, °Brix'), '21')
    await click('Сохранить')

    await waitFor(() =>
      expect(body).toEqual({
        season: 2024,
        estimated_kg: 3000,
        actual_kg: 2800,
        sugar_brix: 21,
      }),
    )
  })

  it('показывает ошибки сохранения и удаления', async () => {
    serve([record])
    server.use(
      http.post(URL_HARVESTS, () =>
        HttpResponse.json({ detail: 'Нельзя сохранить' }, { status: 400 }),
      ),
      http.delete(`${URL_HARVESTS}/h1`, () =>
        HttpResponse.json({ detail: 'Нельзя удалить' }, { status: 400 }),
      ),
    )
    renderDialog()
    await screen.findByText(/22,5 °Brix/)

    await userEvent.type(screen.getByLabelText('Прогноз, кг'), '500')
    await click('Сохранить')
    expect(await screen.findByText(/Нельзя сохранить/)).toBeInTheDocument()

    await click('Удалить урожай 2025')
    expect(await screen.findByText(/Нельзя удалить/)).toBeInTheDocument()
  })

  it('сообщает, что записи не загрузились', async () => {
    server.use(
      http.get(URL_HARVESTS, () =>
        HttpResponse.json({ detail: 'нет' }, { status: 400 }),
      ),
    )
    renderDialog()

    expect(
      await screen.findByText('Не удалось загрузить записи.'),
    ).toBeInTheDocument()
  })
})
