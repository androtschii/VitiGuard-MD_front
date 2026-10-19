import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { pwaState } from '@/test/pwaRegister'
import { UpdatePrompt } from './UpdatePrompt'

afterEach(() => {
  pwaState.needRefresh = false
  pwaState.offlineReady = false
  pwaState.updateServiceWorker.mockReset()
})

describe('UpdatePrompt', () => {
  it('без событий Service Worker ничего не показывает', () => {
    const { container } = render(<UpdatePrompt />)

    expect(container).toBeEmptyDOMElement()
  })

  it('новую версию ставит только по кнопке', async () => {
    pwaState.needRefresh = true
    render(<UpdatePrompt />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Вышла новая версия приложения',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Обновить' }))

    expect(pwaState.updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('обновление можно отложить', async () => {
    pwaState.needRefresh = true
    render(<UpdatePrompt />)

    await userEvent.click(screen.getByRole('button', { name: 'Позже' }))

    expect(screen.queryByRole('status')).toBeNull()
    expect(pwaState.updateServiceWorker).not.toHaveBeenCalled()
  })

  it('сообщает, что приложение работает без сети', async () => {
    pwaState.offlineReady = true
    render(<UpdatePrompt />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Приложение сохранено на устройстве',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Понятно' }))

    expect(screen.queryByRole('status')).toBeNull()
  })
})
