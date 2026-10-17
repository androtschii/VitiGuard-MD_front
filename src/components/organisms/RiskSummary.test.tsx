import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RiskEntry } from '@/api/risks'
import { renderWithQueryClient } from '@/test/render'
import { season } from '@/test/riskData'
import { server } from '@/test/server'
import { RiskSummary } from './RiskSummary'

function renderSummary(entries: RiskEntry[]) {
  server.use(
    http.get('/api/v1/vineyards/vineyard-1/risks', () =>
      HttpResponse.json(entries),
    ),
  )
  renderWithQueryClient(
    <RiskSummary vineyardId="vineyard-1" vineyardName="Криково" />,
  )
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
}

describe('RiskSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('показывает уровни на сегодня и открывает риск по дням', async () => {
    vi.setSystemTime(new Date('2026-06-10T09:00:00Z'))
    const user = renderSummary(season())

    expect(screen.getByText('Загрузка…')).toBeInTheDocument()
    expect(await screen.findByText('Милдью: средний')).toBeInTheDocument()
    expect(screen.getByText('Оидиум: высокий')).toBeInTheDocument()
    expect(screen.queryByText(/Последняя оценка/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Риск по дням' }))
    expect(
      screen.getByRole('dialog', { name: 'Риск болезней: Криково' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('вне сезона показывает последний день с оценкой', async () => {
    vi.setSystemTime(new Date('2026-10-17T09:00:00Z'))
    renderSummary(season())

    expect(
      await screen.findByText('Последняя оценка — 11 июн. 2026 г.'),
    ).toBeInTheDocument()
  })

  it('без оценок предлагает рассчитать', async () => {
    vi.setSystemTime(new Date('2026-06-10T09:00:00Z'))
    renderSummary([])

    expect(await screen.findByText('Риск ещё не рассчитан')).toBeInTheDocument()
  })
})
