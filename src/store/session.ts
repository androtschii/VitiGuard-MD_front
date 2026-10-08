import { create } from 'zustand'

// unknown — сессия ещё восстанавливается при запуске (refresh-запрос не завершился)
type SessionStatus = 'unknown' | 'authenticated' | 'anonymous'

type SessionState = {
  status: SessionStatus
  accessToken: string | null
  setAccessToken: (token: string) => void
  clear: () => void
}

// Access-токен хранится только в памяти, без persist-хранилища: в localStorage
// его мог бы прочитать любой скрипт на странице (XSS), а в памяти он живёт
// до закрытия вкладки. Долгоживущий refresh-токен браузер держит в
// HttpOnly-cookie, недоступной скриптам
export const useSessionStore = create<SessionState>()((set) => ({
  status: 'unknown',
  accessToken: null,
  setAccessToken: (accessToken) =>
    set({ status: 'authenticated', accessToken }),
  clear: () => set({ status: 'anonymous', accessToken: null }),
}))
