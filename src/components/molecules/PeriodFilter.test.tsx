import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { SEASON, type Period } from '@/lib/period'
import { PeriodFilter } from './PeriodFilter'

function Harness({ onChange }: { onChange: (period: Period) => void }) {
  const [period, setPeriod] = useState<Period>(SEASON)
  return (
    <PeriodFilter
      value={period}
      onChange={(next) => {
        setPeriod(next)
        onChange(next)
      }}
    />
  )
}

describe('PeriodFilter', () => {
  it('по умолчанию сезон, переключается на неделю и месяц', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    expect(screen.getByRole('radio', { name: 'Сезон' })).toBeChecked()
    await userEvent.click(screen.getByText('Неделя'))

    expect(onChange).toHaveBeenLastCalledWith({ ...SEASON, kind: 'week' })
    expect(screen.queryByLabelText('С')).not.toBeInTheDocument()
  })

  it('свои даты ограничивают друг друга', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)

    await userEvent.click(screen.getByText('Даты'))
    fireEvent.change(screen.getByLabelText('С'), {
      target: { value: '2026-06-01' },
    })
    fireEvent.change(screen.getByLabelText('По'), {
      target: { value: '2026-06-30' },
    })

    expect(onChange).toHaveBeenLastCalledWith({
      kind: 'custom',
      from: '2026-06-01',
      to: '2026-06-30',
    })
    expect(screen.getByLabelText('С')).toHaveAttribute('max', '2026-06-30')
    expect(screen.getByLabelText('По')).toHaveAttribute('min', '2026-06-01')
  })
})
