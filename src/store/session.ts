import { create } from 'zustand'

// unknown — сессия ещё восстанавливается при запуске (refresh-запрос не завершился)
type SessionStatus = 'unknown' | 'authenticated' | 'anonymous'

type SessionState = {
  status: SessionStatus
  accessToken: string | null
  setAccessToken: (token: string) => void
  clear: () => void
}

// Признак «на этом устройстве выполнен вход» — без токена и данных
// пользователя. Без него при запуске незачем спрашивать сервер о
// refresh-cookie: гостю он ответил бы 401 — лишний запрос и ошибка в консоли
export const SIGNED_IN_KEY = 'vitiguard.signedIn'

export function hasSignedIn() {
  return localStorage.getItem(SIGNED_IN_KEY) === '1'
}

// Access-токен хранится только в памяти, без persist-хранилища: в localStorage
// его мог бы прочитать любой скрипт на странице (XSS), а в памяти он живёт
// до закрытия вкладки. Долгоживущий refresh-токен браузер держит в
// HttpOnly-cookie, недоступной скриптам
export const useSessionStore = create<SessionState>()((set) => ({
  status: 'unknown',
  accessToken: null,
  setAccessToken: (accessToken) => {
    localStorage.setItem(SIGNED_IN_KEY, '1')
    set({ status: 'authenticated', accessToken })
  },
  clear: () => {
    localStorage.removeItem(SIGNED_IN_KEY)
    set({ status: 'anonymous', accessToken: null })
  },
}))
