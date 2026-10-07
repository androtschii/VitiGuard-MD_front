import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('по умолчанию в четыре строки', () => {
    render(<Textarea aria-label="Заметка" />)

    expect(screen.getByRole('textbox', { name: 'Заметка' })).toHaveAttribute(
      'rows',
      '4',
    )
  })
})
