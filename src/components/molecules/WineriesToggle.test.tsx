import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useMapStore } from '@/store/map'
import { WineriesToggle } from './WineriesToggle'

describe('WineriesToggle', () => {
  it('включает слой и показывает легенду', async () => {
    render(<WineriesToggle />)
    expect(screen.queryByRole('list')).toBeNull()

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Винодельни и магазины' }),
    )

    expect(useMapStore.getState().showWineries).toBe(true)
    expect(screen.getByRole('list')).toHaveTextContent('Винодельня')
    await userEvent.click(screen.getByRole('checkbox'))
    expect(useMapStore.getState().showWineries).toBe(false)
  })
})
