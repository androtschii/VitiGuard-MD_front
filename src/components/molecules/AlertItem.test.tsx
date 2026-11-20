import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { alert } from '@/test/alertData'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { AlertItem } from './AlertItem'

describe('AlertItem', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-10T09:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('показывает уровень риска в тексте и плашке (средний риск)', () => {
    renderWithQueryClient(
      <AlertItem
        alert={alert('a-1', {
          level: 'medium',
          disease: 'downy_mildew',
          vineyard_name: 'Криково',
          day: '2026-06-10',
          read_at: '2026-06-10T10:00:00Z',
        })}
      />,
    )

    expect(
      screen.getByText('Милдью: средний риск на участке «Криково»'),
    ).toBeInTheDocument()
    expect(screen.getByText('средний')).toBeInTheDocument()
    expect(screen.getByText('сегодня')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Прочитано' }),
    ).not.toBeInTheDocument()
  })

  it('показывает оидиум, дату «завтра» и пометку прогноза, отмечает прочитанным', async () => {
    let readId = ''
    server.use(
      http.post('/api/v1/alerts/:id/read', ({ params }) => {
        readId = String(params.id)
        return HttpResponse.json(alert('a-2'))
      }),
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    renderWithQueryClient(
      <AlertItem
        alert={alert('a-2', {
          level: 'high',
          disease: 'powdery_mildew',
          vineyard_name: 'Пуркарь',
          day: '2026-06-11',
          forecast: true,
          read_at: null,
        })}
      />,
    )

    expect(
      screen.getByText('Оидиум: высокий риск на участке «Пуркарь»'),
    ).toBeInTheDocument()
    expect(screen.getByText('завтра')).toBeInTheDocument()
    expect(screen.getByText('по прогнозу погоды')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: 'Прочитано' })
    await user.click(button)

    expect(readId).toBe('a-2')
  })

  it('форматирует произвольную дату вне сегодня и завтра', () => {
    renderWithQueryClient(
      <AlertItem
        alert={alert('a-3', {
          level: 'low',
          disease: 'downy_mildew',
          day: '2026-06-15',
          read_at: null,
        })}
      />,
    )

    expect(screen.getByText('15 июня')).toBeInTheDocument()
    expect(
      screen.getByText('Милдью: низкий риск на участке «Криково»'),
    ).toBeInTheDocument()
  })
})
