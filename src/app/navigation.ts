import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useMe } from '@/api/users'
import type { NavItem } from '@/components/organisms/Sidebar'

// Разделы кабинета; подпись — ключ перевода, текст подставляется при выводе
const sections = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.map', href: '/map' },
  { labelKey: 'nav.regions', href: '/regions' },
  { labelKey: 'nav.diagnosis', href: '/diagnosis' },
  { labelKey: 'nav.history', href: '/history' },
  { labelKey: 'nav.profile', href: '/profile' },
] as const

// Раздел администратора виден только администратору (pr-091)
const adminSection = { labelKey: 'nav.admin', href: '/admin' } as const

export function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { data: me } = useMe()
  const visible =
    me?.role === 'admin' ? [...sections, adminSection] : [...sections]

  return visible.map((section) => ({
    label: t(section.labelKey),
    href: section.href,
    current: pathname === section.href,
  }))
}
