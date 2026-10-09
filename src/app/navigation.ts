import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import type { NavItem } from '@/components/organisms/Sidebar'

// Разделы кабинета; подпись — ключ перевода, текст подставляется при выводе
const sections = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.map', href: '/map' },
] as const

export function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return sections.map((section) => ({
    label: t(section.labelKey),
    href: section.href,
    current: pathname === section.href,
  }))
}
