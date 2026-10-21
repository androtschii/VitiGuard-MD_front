import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { UpdatePrompt } from '@/components/organisms/UpdatePrompt'
import { useTelegramStore } from '@/lib/telegram'

// Номер записи в истории вкладки, который ведёт React Router: 0 — приложение
// открыто на этой странице, назад внутри него идти некуда
function canGoBack() {
  const state = window.history.state as { idx?: number } | null
  return (state?.idx ?? 0) > 0
}

export function App() {
  const [router] = useState(() => createBrowserRouter(routes))
  const telegram = useTelegramStore((state) => state.webApp)

  // В Telegram нет кнопки «Назад» браузера: её роль играет кнопка в шапке
  // мини-приложения (pr-086)
  useEffect(() => {
    if (!telegram) return
    const { BackButton } = telegram
    const back = () => void router.navigate(-1)
    const sync = () => (canGoBack() ? BackButton.show() : BackButton.hide())
    sync()
    const unsubscribe = router.subscribe(sync)
    BackButton.onClick(back)
    return () => {
      unsubscribe()
      BackButton.offClick(back)
      BackButton.hide()
    }
  }, [router, telegram])

  return (
    <>
      <RouterProvider router={router} />
      <UpdatePrompt />
    </>
  )
}
