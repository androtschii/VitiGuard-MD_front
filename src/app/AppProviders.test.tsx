import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as monitoring from '@/lib/monitoring'
import { AppProviders } from './AppProviders'

function Broken(): never {
  throw new Error('Провайдер сломался')
}

describe('AppProviders', () => {
  it('ошибка вне маршрутов — экран ошибки и отчёт в мониторинг', () => {
    const report = vi.spyOn(monitoring, 'reportError')
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <AppProviders>
        <Broken />
      </AppProviders>,
    )

    expect(
      screen.getByRole('button', { name: 'Обновить страницу' }),
    ).toBeInTheDocument()
    const [error, extra] = report.mock.calls[0] ?? []
    expect(error).toEqual(new Error('Провайдер сломался'))
    expect(typeof extra?.componentStack).toBe('string')
  })
})
