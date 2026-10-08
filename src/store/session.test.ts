import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore } from './session'

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState(useSessionStore.getInitialState(), true)
  })

  it('сначала состояние неизвестно: сессия ещё восстанавливается', () => {
    expect(useSessionStore.getState()).toMatchObject({
      status: 'unknown',
      accessToken: null,
    })
  })

  it('после входа хранит токен и считает пользователя вошедшим', () => {
    useSessionStore.getState().setAccessToken('token')

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'token',
    })
  })

  it('при выходе забывает токен', () => {
    useSessionStore.getState().setAccessToken('token')

    useSessionStore.getState().clear()

    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
    })
  })

  it('не записывает токен в постоянное хранилище браузера', () => {
    useSessionStore.getState().setAccessToken('secret-token')

    const stored = [localStorage, sessionStorage].flatMap((storage) =>
      Object.keys(storage).map((key) => storage.getItem(key)),
    )
    expect(stored.join('')).not.toContain('secret-token')
  })
})
