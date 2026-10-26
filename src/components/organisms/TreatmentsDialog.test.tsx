import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Treatment, TreatmentPlan } from '@/api/treatments'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { TreatmentsDialog } from './TreatmentsDialog'

const TREATMENTS_URL = '/api/v1/vineyards/v-1/treatments'
const PLAN_URL = '/api/v1/vineyards/v-1/treatments/plan'

const sampleTreatments: Treatment[] = [
  {
    id: 't-1',
    vineyard_id: 'v-1',
    applied_on: '2026-06-05',
    fungicide: 'contact',
    product: 'Купроксат',
    created_at: '2026-06-05T08:00:00Z',
    updated_at: '2026-06-05T08:00:00Z',
  },
  {
    id: 't-2',
    vineyard_id: 'v-1',
    applied_on: '2026-06-01',
    fungicide: 'systemic',
    product: null,
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-06-01T08:00:00Z',
  },
]

const samplePlan: TreatmentPlan = {
  today: '2026-06-10',
  protected_until: {
    downy_mildew: '2026-06-13',
    powdery_mildew: null,
  },
  recommendations: [
    {
      action: 'protect',
      disease: 'powdery_mildew',
      fungicide: 'sulfur',
      due_by: '2026-06-12',
      risk_day: '2026-06-13',
      reason: 'powdery_high',
    },
    {
      action: 'inspect',
      disease: 'downy_mildew',
      fungicide: null,
      due_by: '2026-06-14',
      risk_day: '2026-06-14',
      reason: 'downy_symptoms',
    },
  ],
}

function renderDialog(
  treatments: Treatment[] = sampleTreatments,
  plan: TreatmentPlan = samplePlan,
) {
  server.use(
    http.get(TREATMENTS_URL, () => HttpResponse.json(treatments)),
    http.get(PLAN_URL, () => HttpResponse.json(plan)),
  )
  renderWithQueryClient(
    <TreatmentsDialog
      vineyardId="v-1"
      vineyardName="Криково"
      open
      onClose={vi.fn()}
    />,
  )
  return userEvent.setup()
}

function renderDialogRaw() {
  renderWithQueryClient(
    <TreatmentsDialog
      vineyardId="v-1"
      vineyardName="Криково"
      open
      onClose={vi.fn()}
    />,
  )
  return userEvent.setup()
}

describe('TreatmentsDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-10T09:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('отображает статус защиты, рекомендации плана и журнал обработок', async () => {
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Обработки и план: Криково' }),
    ).toBeInTheDocument()

    // План и защита
    expect(
      await screen.findByText(/Защищён до 13 июн\. 2026 г\./),
    ).toBeInTheDocument()
    expect(screen.getByText('Не защищён')).toBeInTheDocument()

    // Рекомендации
    expect(screen.getByText('Защитная обработка')).toBeInTheDocument()
    expect(screen.getByText('Осмотр участка')).toBeInTheDocument()
    expect(
      screen.getByText('Высокий риск оидиума (индекс ≥ 60)'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Ожидаются пятна милдью по модели Гойданича'),
    ).toBeInTheDocument()

    // Журнал обработок
    expect(screen.getByText('Купроксат')).toBeInTheDocument()
    expect(screen.getByText('Контактный (медь, манкоцеб)')).toBeInTheDocument()
    expect(screen.getByText('5 июн. 2026 г.')).toBeInTheDocument()
  })

  it('сообщает, если рекомендаций нет и журнал пуст', async () => {
    renderDialog([], {
      today: '2026-06-10',
      protected_until: { downy_mildew: null, powdery_mildew: null },
      recommendations: [],
    })

    expect(
      await screen.findByText(
        'Рекомендаций по обработкам нет: участок защищён либо условий для заражения нет.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Обработок пока не записано.')).toBeInTheDocument()
  })

  it('позволяет записать новую обработку', async () => {
    let createdPayload: unknown = null
    server.use(
      http.post(TREATMENTS_URL, async ({ request }) => {
        createdPayload = await request.json()
        return HttpResponse.json(
          {
            id: 't-3',
            vineyard_id: 'v-1',
            applied_on: '2026-06-09',
            fungicide: 'systemic',
            product: 'Ридомил Голд',
            created_at: '2026-06-09T08:00:00Z',
            updated_at: '2026-06-09T08:00:00Z',
          },
          { status: 201 },
        )
      }),
    )

    const user = renderDialog([])
    await screen.findByText('Обработок пока не записано.')

    await user.click(screen.getByRole('button', { name: 'Записать обработку' }))

    fireEvent.change(screen.getByLabelText(/Дата обработки/), {
      target: { value: '2026-06-09' },
    })
    fireEvent.change(screen.getByLabelText(/Тип препарата/), {
      target: { value: 'systemic' },
    })
    fireEvent.change(screen.getByLabelText(/Название препарата/), {
      target: { value: 'Ридомил Голд' },
    })

    await user.click(screen.getByRole('button', { name: 'Записать' }))

    expect(createdPayload).toEqual({
      applied_on: '2026-06-09',
      fungicide: 'systemic',
      product: 'Ридомил Голд',
    })
  })

  it('отклоняет дату обработки в будущем', async () => {
    const user = renderDialog()
    await screen.findByText('Купроксат')

    await user.click(screen.getByRole('button', { name: 'Записать обработку' }))

    fireEvent.change(screen.getByLabelText(/Дата обработки/), {
      target: { value: '2026-06-15' },
    })

    await user.click(screen.getByRole('button', { name: 'Записать' }))

    expect(
      screen.getByText('Дата обработки ещё не наступила'),
    ).toBeInTheDocument()
  })

  it('удаляет запись об обработке', async () => {
    let deletedId: string | null = null
    server.use(
      http.delete(`${TREATMENTS_URL}/:id`, ({ params }) => {
        deletedId = String(params.id)
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const user = renderDialog()
    await screen.findByText('Купроксат')

    await user.click(
      screen.getByRole('button', {
        name: 'Удалить запись об обработке от 5 июн. 2026 г.',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Подтвердить удаление записи от 5 июн. 2026 г.',
      }),
    )

    expect(deletedId).toBe('t-1')
  })

  it('не удаляет запись без подтверждения и отменяет удаление', async () => {
    let deleted = false
    server.use(
      http.delete(`${TREATMENTS_URL}/:id`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = renderDialog()
    await screen.findByText('Купроксат')

    await user.click(
      screen.getByRole('button', {
        name: 'Удалить запись об обработке от 5 июн. 2026 г.',
      }),
    )
    expect(screen.getByText('Удалить запись?')).toBeInTheDocument()
    expect(deleted).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(screen.queryByText('Удалить запись?')).not.toBeInTheDocument()
    expect(deleted).toBe(false)
  })

  it('показывает ошибку сервера при сохранении', async () => {
    server.use(
      http.post(TREATMENTS_URL, () =>
        HttpResponse.json(
          { detail: 'Сервер отклонил обработку' },
          { status: 400 },
        ),
      ),
    )

    const user = renderDialog([])
    await screen.findByText('Обработок пока не записано.')

    await user.click(screen.getByRole('button', { name: 'Записать обработку' }))
    await user.click(screen.getByRole('button', { name: 'Записать' }))

    expect(
      await screen.findByText('Сервер отклонил обработку'),
    ).toBeInTheDocument()
  })

  it('закрывает форму добавления по кнопке Отмена', async () => {
    const user = renderDialog()
    await screen.findByText('Купроксат')

    await user.click(screen.getByRole('button', { name: 'Записать обработку' }))
    expect(screen.getByLabelText(/Дата обработки/)).toBeInTheDocument()

    const cancelButtons = screen.getAllByRole('button', { name: 'Отмена' })
    await user.click(cancelButtons[cancelButtons.length - 1])
    expect(screen.queryByLabelText(/Дата обработки/)).not.toBeInTheDocument()
  })

  it('отображает ошибку загрузки плана', async () => {
    server.use(
      http.get(PLAN_URL, () =>
        HttpResponse.json(
          { detail: 'Не удалось загрузить план' },
          { status: 400 },
        ),
      ),
      http.get(TREATMENTS_URL, () => HttpResponse.json([])),
    )
    renderDialogRaw()
    expect(
      await screen.findByText('Не удалось загрузить план'),
    ).toBeInTheDocument()
  })

  it('отображает ошибку загрузки журнала', async () => {
    server.use(
      http.get(TREATMENTS_URL, () =>
        HttpResponse.json(
          { detail: 'Не удалось загрузить журнал' },
          { status: 400 },
        ),
      ),
      http.get(PLAN_URL, () => HttpResponse.json(samplePlan)),
    )
    renderDialogRaw()
    expect(
      await screen.findByText('Не удалось загрузить журнал'),
    ).toBeInTheDocument()
  })

  it('отображает ошибку удаления обработки', async () => {
    server.use(
      http.delete(`${TREATMENTS_URL}/:id`, () =>
        HttpResponse.json({ detail: 'Не удалось удалить' }, { status: 400 }),
      ),
    )
    const user = renderDialog()
    await screen.findByText('Купроксат')
    await user.click(
      screen.getByRole('button', {
        name: 'Удалить запись об обработке от 5 июн. 2026 г.',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: 'Подтвердить удаление записи от 5 июн. 2026 г.',
      }),
    )
    expect(await screen.findByText('Не удалось удалить')).toBeInTheDocument()
  })
})
