import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { NdviAnomaly } from '@/api/vegetation'
import { scan, vineyard } from '@/test/ndviData'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { VineyardComparison } from './VineyardComparison'

const a = {
  ...vineyard('v1', 'Криково'),
  variety: { id: 'merlot', name: 'Merlot', berry_color: 'red' as const },
  planting_year: 2015,
}
const b = vineyard('v2', 'Пуркарь')

function drop(level: NdviAnomaly['level']): NdviAnomaly {
  return {
    acquired_at: '2026-08-29T09:17:00Z',
    ndvi: 0.5,
    below_norm: 0.2,
    below_peers: null,
    z: 4,
    level,
  }
}

function useData({ common = true } = {}) {
  server.use(
    http.get('/api/v1/vineyards/:id/vegetation', ({ params }) =>
      HttpResponse.json(
        params.id === 'v1'
          ? [scan('a1', '2026-06-25'), scan('a2', '2026-08-29')]
          : common
            ? [scan('b1', '2026-07-10'), scan('b2', '2026-09-01')]
            : [],
      ),
    ),
    http.get('/api/v1/vineyards/:id/vegetation/anomalies', ({ params }) =>
      HttpResponse.json(
        params.id === 'v1' ? [drop('suspected'), drop('confirmed')] : [],
      ),
    ),
    http.get('/api/v1/risks/today', () =>
      HttpResponse.json([
        { vineyard_id: 'v1', day: '2026-08-29', downy: 'high', powdery: 'low' },
      ]),
    ),
  )
}

function row(name: string) {
  const header = screen.getByRole('rowheader', { name })
  return within(header.closest('tr') as HTMLElement)
    .getAllByRole('cell')
    .map((cell) => cell.textContent)
}

describe('VineyardComparison', () => {
  it('сводит паспорт, риск, вегетацию и просадки двух участков', async () => {
    useData()
    renderWithQueryClient(<VineyardComparison a={a} b={b} />)

    expect(
      screen.getByRole('columnheader', { name: 'Криково' }),
    ).toBeInTheDocument()
    expect(row('Площадь')).toEqual(['1,2 га', '1,2 га'])
    expect(row('Сорт')).toEqual(['Merlot', '—'])
    expect(row('Год посадки')).toEqual(['2015', '—'])
    expect(await screen.findByText('высокий')).toBeInTheDocument()
    expect(row('Милдью сегодня')).toEqual(['высокий', '—'])
    expect(row('Оидиум сегодня')).toEqual(['низкий', '—'])
    expect(await screen.findByText(/0,71 · 29 авг/)).toBeInTheDocument()
    expect(row('Снимков без облаков')).toEqual(['2', '2'])
    expect(await screen.findByText('2, подтверждённых: 1')).toBeInTheDocument()
    expect(row('Просадки NDVI')).toEqual(['2, подтверждённых: 1', 'нет'])
  })

  it('рисует NDVI обоих участков за общий период', async () => {
    useData()
    renderWithQueryClient(<VineyardComparison a={a} b={b} />)

    const chart = await screen.findByRole('img', {
      name: /NDVI участков Криково \(A\) и Пуркарь \(B\) с 10 июл\. 2026 г\. по 29 авг\. 2026 г\./,
    })
    expect(chart).toBeInTheDocument()
    expect(screen.getByText('A — Криково')).toBeInTheDocument()
    expect(screen.getByText('B — Пуркарь')).toBeInTheDocument()
  })

  it('без общего периода снимков объясняет, что сделать', async () => {
    useData({ common: false })
    renderWithQueryClient(<VineyardComparison a={a} b={b} />)

    expect(
      await screen.findByText(/нет общего периода снимков/),
    ).toBeInTheDocument()
    expect(row('Последний NDVI')[1]).toBe('—')
  })
})
