import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardSkeleton } from './CardSkeleton'

describe('CardSkeleton', () => {
  it('сообщает дикторам о загрузке, а полосы скрывает', () => {
    render(<CardSkeleton lines={2} />)
    const status = screen.getByRole('status')

    expect(status).toHaveTextContent('Загрузка…')
    expect(status.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3)
  })
})
