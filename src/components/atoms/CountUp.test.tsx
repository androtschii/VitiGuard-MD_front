import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CountUp } from './CountUp'

describe('CountUp', () => {
  it('по умолчанию округляет до целого', () => {
    render(<CountUp value={3.6} />)

    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('показывает число в заданном формате', () => {
    render(<CountUp value={2.5} format={(value) => `${value} га`} />)

    expect(screen.getByText('2.5 га')).toBeInTheDocument()
  })
})
