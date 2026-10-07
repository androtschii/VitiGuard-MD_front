import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from './ui'

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState(useUiStore.getInitialState(), true)
  })

  it('по умолчанию боковая панель закрыта', () => {
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
  })

  it('переключает и закрывает боковую панель', () => {
    const { toggleSidebar, closeSidebar } = useUiStore.getState()

    toggleSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(true)

    toggleSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(false)

    toggleSidebar()
    closeSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
  })
})
