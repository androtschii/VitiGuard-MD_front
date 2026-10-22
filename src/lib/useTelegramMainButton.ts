import { useEffect, useRef } from 'react'
import type { TelegramWebApp } from './telegram'

type MainButtonOptions = {
  text: string
  visible: boolean
  loading: boolean
  onClick: () => void
}

// Главное действие экрана — кнопкой Telegram внизу окна (pr-088): до неё
// дотягивается большой палец, и она выглядит как часть Telegram. Вне
// Telegram (webApp === null) ничего не делает — экран показывает свою кнопку
export function useTelegramMainButton(
  webApp: TelegramWebApp | null,
  { text, visible, loading, onClick }: MainButtonOptions,
) {
  // Обработчик меняется с каждым рендером, а подписка — одна
  const handler = useRef(onClick)
  useEffect(() => {
    handler.current = onClick
  }, [onClick])

  useEffect(() => {
    if (!webApp) return
    const button = webApp.MainButton
    const click = () => handler.current()
    button.onClick(click)
    return () => {
      button.offClick(click)
      button.hide()
    }
  }, [webApp])

  useEffect(() => {
    if (!webApp) return
    const button = webApp.MainButton
    button.setText(text)
    if (visible) button.show()
    else button.hide()
    if (loading) button.showProgress(false)
    else button.hideProgress()
  }, [webApp, text, visible, loading])
}
