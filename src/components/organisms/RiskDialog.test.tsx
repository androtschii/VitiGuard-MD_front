import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RiskEntry } from '@/api/risks'
import { renderWithQueryClient } from '@/test/render'
import { risk, season } from '@/test/riskData'
import { server } from '@/test/server'
import { RiskDialog } from './RiskDialog'

const URL = '/api/v1/vineyards/vineyard-1/risks'

function renderDialog(entries: RiskEntry[] = season()) {
  server.use(http.get(URL, () => HttpResponse.json(entries)))
  renderWithQueryClient(
    <RiskDialog
      vineyardId="vineyard-1"
      vineyardName="Криково"
      open
      onClose={vi.fn()}
    />,
  )
  return userEvent.setup()
}

describe('RiskDialog', () => {
  beforeEach(() => {
    // «Сегодня» в Кишинёве — 10 июня 2026
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-10T09:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('показывает риск сегодня, неделю вперёд и графики сезона', async () => {
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Риск болезней: Криково' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Милдью: средний')).toBeInTheDocument()
    expect(screen.getByText('Оидиум: высокий')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Идёт инкубация милдью после заражения 2 июн. 2026 г.: пройдено 63 %. Индекс оидиума Gubler-Thomas — 80./,
      ),
    ).toBeInTheDocument()

    const plan = screen.getByRole('table', {
      name: 'Что делать: сегодня и неделя вперёд (по прогнозу погоды)',
    })
    const rows = within(plan).getAllByRole('row')
    expect(rows).toHaveLength(3)
    // Сегодня: инкубация милдью и высокий индекс оидиума
    expect(rows[1]).toHaveTextContent(/^Сегодня/)
    expect(rows[1]).toHaveTextContent(/осмотрите листья снизу/)
    expect(rows[1]).toHaveTextContent(/обработка серой/)
    expect(rows[2]).toHaveTextContent(/11 июн. 2026 г.\s*высокий\s*средний/)
    expect(rows[2]).toHaveTextContent(/Ожидаются пятна милдью/)

    expect(
      screen.getByRole('img', { name: /График индекса Gubler-Thomas/ }),
    ).toBeInTheDocument()
    const downy = screen.getByRole('img', {
      name: /График продвижения инкубации милдью/,
    })
    // Треугольник дня заражения с подписью
    expect(within(downy).getByText(/Заражение по правилу/)).toBeInTheDocument()
  })

  it('показывает температуру и осадки сезона на отдельных графиках', async () => {
    renderDialog([
      ...season(),
      risk('2026-06-03', 'goidanich', 0, 'low', {
        mean_temp: 19.5,
        precipitation_mm: 14,
      }),
      risk('2026-06-04', 'goidanich', 0, 'low', {
        mean_temp: 22,
        precipitation_mm: 0,
      }),
    ])

    const temperature = await screen.findByRole('img', {
      name: /средней суточной температуры/,
    })
    expect(within(temperature).getByText('20 °C')).toBeInTheDocument()
    const rain = screen.getByRole('img', { name: /Столбцы осадков/ })
    // Сухой день столбца не рисует
    expect(
      within(rain).getByTestId('chart-bars-precipitation').children,
    ).toHaveLength(1)
    expect(screen.getByText('Осадки за сутки, мм')).toBeInTheDocument()
  })

  it('без осадков в старых записях — только температура', async () => {
    renderDialog([
      ...season(),
      risk('2026-06-03', 'goidanich', 0, 'low', { mean_temp: 19.5 }),
    ])

    expect(
      await screen.findByRole('img', { name: /средней суточной температуры/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Столбцы осадков/ })).toBeNull()
  })

  it('сообщает об ожидаемых пятнах', async () => {
    vi.setSystemTime(new Date('2026-06-11T09:00:00Z'))
    renderDialog()

    expect(
      await screen.findByText(/ожидаются пятна милдью после заражения 2 июн/),
    ).toBeInTheDocument()
  })

  it('без инкубации так и пишет', async () => {
    renderDialog([
      risk('2026-06-10', 'three_tens', 0),
      risk('2026-06-10', 'gubler_thomas', 0, 'low', { index: 0 }),
    ])

    expect(
      await screen.findByText(
        /Инкубации милдью сейчас нет. Индекс оидиума Gubler-Thomas — 0./,
      ),
    ).toBeInTheDocument()
  })

  it('без оценки оидиума на сегодня индекс считается нулевым', async () => {
    renderDialog([risk('2026-06-10', 'three_tens', 0)])

    expect(
      await screen.findByText(/Индекс оидиума Gubler-Thomas — 0./),
    ).toBeInTheDocument()
  })

  it('фильтр периода сужает графики сезона, но не сегодняшний риск', async () => {
    const user = renderDialog()
    await screen.findByRole('img', { name: /индекса Gubler-Thomas/ })

    await user.click(screen.getByText('Даты'))
    fireEvent.change(screen.getByLabelText('С'), {
      target: { value: '2026-07-01' },
    })

    expect(
      screen.queryByRole('img', { name: /индекса Gubler-Thomas/ }),
    ).toBeNull()
    expect(screen.getByText(/Идёт инкубация милдью/)).toBeInTheDocument()
  })

  it('вне сезона объясняет, почему нет риска на сегодня', async () => {
    vi.setSystemTime(new Date('2026-10-17T09:00:00Z'))
    renderDialog()

    expect(await screen.findByText(/Сегодня вне сезона/)).toBeInTheDocument()
    expect(
      screen.queryByRole('table', { name: /Неделя вперёд/ }),
    ).not.toBeInTheDocument()
  })

  it('пересчитывает риск по свежей погоде', async () => {
    let refreshed = false
    server.use(
      http.post(`${URL}/refresh`, () => {
        refreshed = true
        return HttpResponse.json(season())
      }),
    )
    const user = renderDialog([])

    expect(await screen.findByText(/Риск ещё не рассчитан/)).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Пересчитать по свежей погоде' }),
    )

    expect(await screen.findByText('Оидиум: высокий')).toBeInTheDocument()
    expect(refreshed).toBe(true)
  })

  it('показывает причины ошибок', async () => {
    server.use(
      http.post(`${URL}/refresh`, () =>
        HttpResponse.json(
          { detail: 'Сервис погоды недоступен' },
          { status: 502 },
        ),
      ),
    )
    const user = renderDialog()
    await screen.findByText('Оидиум: высокий')

    await user.click(
      screen.getByRole('button', { name: 'Пересчитать по свежей погоде' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сервис погоды недоступен',
    )
  })

  it('показывает, если риск не загрузился', async () => {
    server.use(
      http.get(URL, () =>
        HttpResponse.json({ detail: 'Сервер недоступен' }, { status: 503 }),
      ),
    )
    renderWithQueryClient(
      <RiskDialog
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

  it('показывает вероятность вспышки за неделю и по дням из ансамбля', async () => {
    server.use(
      http.get(`${URL}/outlook`, () =>
        HttpResponse.json({
          members: 40,
          days: [
            { day: '2026-06-11', downy: 0.35, powdery: 0.1 },
            { day: '2026-06-12', downy: 0.5, powdery: 0.25 },
          ],
          downy_week: 0.6,
          powdery_week: 0.3,
        }),
      ),
    )
    renderDialog()

    const outlookRegion = await screen.findByRole('region', {
      name: 'Вероятность вспышки на 7 дней',
    })
    expect(outlookRegion).toBeInTheDocument()
    expect(
      within(outlookRegion).getByText('Ансамбль ICON-EPS: 40 вариантов'),
    ).toBeInTheDocument()
    expect(within(outlookRegion).getByText('60 %')).toBeInTheDocument()
    expect(within(outlookRegion).getByText('30 %')).toBeInTheDocument()

    // В строке прогноза на 11 июня показаны вероятности вспышки под бейджами
    expect(screen.getByText('35 %')).toBeInTheDocument()
    expect(screen.getByText('10 %')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Под уровнем риска в строках прогноза указана вероятность вспышки по ансамблю ICON-EPS.',
      ),
    ).toBeInTheDocument()
  })

  it('вне сезона показывает «вне сезона» вместо процентов вспышки', async () => {
    server.use(
      http.get(`${URL}/outlook`, () =>
        HttpResponse.json({
          members: 0,
          days: [{ day: '2026-06-11', downy: null, powdery: null }],
          downy_week: null,
          powdery_week: null,
        }),
      ),
    )
    renderDialog()

    const outlookRegion = await screen.findByRole('region', {
      name: 'Вероятность вспышки на 7 дней',
    })
    expect(outlookRegion).toBeInTheDocument()
    expect(
      within(outlookRegion).getByText('Ансамбль ICON-EPS: 0 вариантов'),
    ).toBeInTheDocument()
    const allOffSeason = screen.getAllByText('вне сезона')
    // В сводке за неделю (для милдью и оидиума) и в ячейках дня
    expect(allOffSeason.length).toBeGreaterThanOrEqual(2)
  })

  it('пересчёт по свежей погоде обновляет и вероятность вспышки', async () => {
    let outlookCalls = 0
    server.use(
      http.get(`${URL}/outlook`, () => {
        outlookCalls++
        const val = outlookCalls === 1 ? 0.2 : 0.45
        return HttpResponse.json({
          members: 40,
          days: [{ day: '2026-06-11', downy: val, powdery: 0.1 }],
          downy_week: val,
          powdery_week: 0.1,
        })
      }),
      http.post(`${URL}/refresh`, () => HttpResponse.json(season())),
    )
    const user = renderDialog()
    const outlookRegion = await screen.findByRole('region', {
      name: 'Вероятность вспышки на 7 дней',
    })
    expect(within(outlookRegion).getByText('20 %')).toBeInTheDocument()
    expect(outlookCalls).toBe(1)

    await user.click(
      screen.getByRole('button', { name: 'Пересчитать по свежей погоде' }),
    )

    // После успешного refresh queryClient инвалидирует outlook, и он перезапрашивается со значением 45 %
    const updated = await screen.findAllByText('45 %')
    expect(updated.length).toBeGreaterThanOrEqual(1)
    expect(outlookCalls).toBe(2)
  })
})
