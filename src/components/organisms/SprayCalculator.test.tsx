import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SprayCalculator } from './SprayCalculator'

describe('SprayCalculator', () => {
  it('считает раствор только по полным данным', async () => {
    render(<SprayCalculator areaHa={1} />)

    await userEvent.clear(screen.getByLabelText('Площадь, га'))
    await userEvent.type(screen.getByLabelText('Площадь, га'), '2')
    await userEvent.type(
      screen.getByLabelText('Норма с этикетки, л или кг/га'),
      '1.5',
    )
    await userEvent.type(screen.getByLabelText('Вода, л/га'), '500')
    expect(screen.queryByText(/Препарата/)).toBeNull()

    await userEvent.type(screen.getByLabelText('Бак, л'), '400')

    expect(screen.getByText(/Препарата: 3, воды: 1\s000 л/)).toBeInTheDocument()
    expect(screen.getByText(/баков: 3, в каждый: 1,2/)).toBeInTheDocument()
  })
})
