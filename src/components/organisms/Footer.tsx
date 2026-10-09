import { useTranslation } from 'react-i18next'
export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-line bg-surface px-4 py-3 text-xs text-ink-subtle">
      © {new Date().getFullYear()} VitiGuard MD — {t('footer.tagline')}
    </footer>
  )
}
