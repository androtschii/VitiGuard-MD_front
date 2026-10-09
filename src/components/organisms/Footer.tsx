import { useTranslation } from 'react-i18next'
export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-stone-200 bg-white px-4 py-3 text-xs text-stone-500">
      © {new Date().getFullYear()} VitiGuard MD — {t('footer.tagline')}
    </footer>
  )
}
