import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useMapStore } from '@/store/map'
import { NdviToggle } from './NdviToggle'

describe('NdviToggle', () => {
  it('включает и выключает картограмму NDVI', async () => {
    render(<NdviToggle />)
    const checkbox = screen.getByRole('checkbox', { name: 'Картограмма NDVI' })

    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    expect(useMapStore.getState().showNdvi).toBe(true)
    await userEvent.click(checkbox)
    expect(useMapStore.getState().showNdvi).toBe(false)
  })

  it('шкалу и подсказку показывает только при включённом слое', async () => {
    render(<NdviToggle />)
    expect(screen.queryByText(/густая листва/)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByText('0 · почва')).toBeInTheDocument()
    expect(screen.getByText('1 · густая листва')).toBeInTheDocument()
    expect(screen.getByText(/обновите вегетацию/)).toBeInTheDocument()
  })

  it('слайдер задаёт прозрачность картограмм', () => {
    useMapStore.setState({ showNdvi: true })
    render(<NdviToggle />)
    const slider = screen.getByRole('slider', { name: /Прозрачность/ })

    expect(slider).toHaveValue('15')
    expect(screen.getByText('15 %')).toBeInTheDocument()
    fireEvent.change(slider, { target: { value: '60' } })

    expect(useMapStore.getState().ndviOpacity).toBeCloseTo(0.4)
    expect(screen.getByText('60 %')).toBeInTheDocument()
  })
})
