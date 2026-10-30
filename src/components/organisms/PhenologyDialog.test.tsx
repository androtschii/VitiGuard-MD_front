import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { localToday } from '@/lib/riskSeries'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { PhenologyDialog } from './PhenologyDialog'

const URL_PHENOLOGY = '/api/v1/vineyards/plot-1/phenology'
const observation = (id: string, observed_on: string, stage: number) => ({
  id,
  vineyard_id: 'plot-1',
  observed_on,
  stage,
  created_at: `${observed_on}T00:00:00Z`,
  updated_at: `${observed_on}T00:00:00Z`,
})

function serve(items: unknown[]) {
  server.use(http.get(URL_PHENOLOGY, () => HttpResponse.json(items)))
}

function renderDialog() {
  return renderWithQueryClient(
    <PhenologyDialog
      vineyardId="plot-1"
      vineyardName="Криково"
      open
      onClose={() => {}}
    />,
  )
}

describe('PhenologyDialog', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '')
    })
  })

  it('показывает текущую фазу этого сезона и удаляет отметку', async () => {
    const year = localToday().slice(0, 4)
    serve([observation('a', `${year}-01-05`, 23)])
    let deleted = false
    server.use(
      http.delete(`${URL_PHENOLOGY}/a`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderDialog()

    expect(
      await screen.findByText('Сейчас: цветение, 50 % колпачков'),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: /Удалить отметку/, hidden: true }),
    )
    await waitFor(() => expect(deleted).toBe(true))
  })

  it('прошлый сезон текущей фазой не считает', async () => {
    serve([observation('a', '2001-06-01', 23)])
    renderDialog()

    expect(
      await screen.findByText('В этом сезоне фаз ещё не отмечено'),
    ).toBeInTheDocument()
  })

  it('отправляет выбранные день и фазу', async () => {
    serve([])
    let body: unknown
    server.use(
      http.post(URL_PHENOLOGY, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(observation('n', localToday(), 35), {
          status: 201,
        })
      }),
    )
    renderDialog()
    await screen.findByText('Отметок пока нет.')

    await userEvent.selectOptions(screen.getByLabelText(/Фаза/), '35')
    await userEvent.clear(screen.getAllByLabelText(/День/)[0])
    await userEvent.type(screen.getAllByLabelText(/День/)[0], '2026-01-02')
    await userEvent.click(
      screen.getByRole('button', { name: 'Отметить фазу', hidden: true }),
    )

    await waitFor(() =>
      expect(body).toEqual({ observed_on: '2026-01-02', stage: 35 }),
    )
  })

  it('показывает ошибки сохранения и удаления', async () => {
    serve([observation('a', '2001-06-01', 4)])
    server.use(
      http.post(URL_PHENOLOGY, () =>
        HttpResponse.json({ detail: 'Нельзя сохранить' }, { status: 400 }),
      ),
      http.delete(`${URL_PHENOLOGY}/a`, () =>
        HttpResponse.json({ detail: 'Нельзя удалить' }, { status: 400 }),
      ),
    )
    renderDialog()
    await screen.findByRole('button', { name: /Удалить отметку/, hidden: true })

    await userEvent.click(
      screen.getByRole('button', { name: 'Отметить фазу', hidden: true }),
    )
    expect(await screen.findByText(/Нельзя сохранить/)).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: /Удалить отметку/, hidden: true }),
    )
    expect(await screen.findByText(/Нельзя удалить/)).toBeInTheDocument()
  })

  it('предупреждает, если сбор попадает на срок ожидания', async () => {
    serve([])
    server.use(
      http.get('/api/v1/vineyards/plot-1/treatments', () =>
        HttpResponse.json([{ applied_on: '2999-01-01', waiting_days: 21 }]),
      ),
    )
    renderDialog()
    await screen.findByText('Отметок пока нет.')
    expect(screen.queryByText(/Срок ожидания ещё идёт/)).toBeNull()

    await userEvent.selectOptions(screen.getByLabelText(/Фаза/), '38')

    expect(
      await screen.findByText(/Срок ожидания ещё идёт/),
    ).toBeInTheDocument()
  })

  it('сообщает, что отметки не загрузились', async () => {
    server.use(
      http.get(URL_PHENOLOGY, () =>
        HttpResponse.json({ detail: 'нет' }, { status: 400 }),
      ),
    )
    renderDialog()

    expect(
      await screen.findByText('Не удалось загрузить отметки.'),
    ).toBeInTheDocument()
  })
})
