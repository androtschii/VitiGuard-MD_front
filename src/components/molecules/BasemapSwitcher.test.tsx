import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BasemapSwitcher } from './BasemapSwitcher'

describe('BasemapSwitcher', () => {
  it('группа подписана, выбранная подложка отмечена', () => {
    render(<BasemapSwitcher value="satellite" onChange={vi.fn()} />)

    expect(screen.getByRole('group', { name: 'Подложка' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Спутник' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Схема' })).not.toBeChecked()
  })

  it('сообщает о выборе другой подложки', async () => {
    const onChange = vi.fn()
    render(<BasemapSwitcher value="scheme" onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Гибрид' }))

    expect(onChange).toHaveBeenCalledWith('hybrid')
  })

  it('переключается стрелками клавиатуры', async () => {
    const onChange = vi.fn()
    render(<BasemapSwitcher value="scheme" onChange={onChange} />)

    screen.getByRole('radio', { name: 'Схема' }).focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(onChange).toHaveBeenCalledWith('satellite')
  })
})
