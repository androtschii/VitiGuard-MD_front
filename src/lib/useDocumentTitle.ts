import { useEffect } from 'react'

const APP_NAME = 'VitiGuard MD'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const clean = title?.trim()
    document.title =
      clean && clean !== APP_NAME ? `${clean} — ${APP_NAME}` : APP_NAME
  }, [title])
}
