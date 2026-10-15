import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useMapStore } from '@/store/map'
import { OsmToggle } from './OsmToggle'

describe('OsmToggle', () => {
  it('включает и выключает слой OpenStreetMap', async () => {
    render(<OsmToggle />)
    const checkbox = screen.getByRole('checkbox', {
      name: 'Виноградники OpenStreetMap',
    })

    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    expect(useMapStore.getState().showOsm).toBe(true)
    await userEvent.click(checkbox)
    expect(useMapStore.getState().showOsm).toBe(false)
  })

  it('просит приблизить карту, только когда слой включён', () => {
    useMapStore.setState({ osmTooFar: true })
    render(<OsmToggle />)
    expect(screen.queryByText(/приблизьте/i)).not.toBeInTheDocument()

    act(() => useMapStore.setState({ showOsm: true }))
    expect(screen.getByText(/приблизьте/i)).toBeInTheDocument()
  })
})
