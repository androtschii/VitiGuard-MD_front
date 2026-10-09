import { useTranslation } from 'react-i18next'
import { useNavItems } from '@/app/navigation'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { MapView } from '@/components/organisms/MapView'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

export function MapPage() {
  const { t } = useTranslation()
  const navItems = useNavItems()

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-3 text-xl font-semibold text-ink">{t('map.title')}</h1>
      {/* Высота экрана без шапки, заголовка и подвала; на низких экранах — не меньше 24rem */}
      <MapView className="h-[calc(100svh-12rem)] min-h-96" />
    </DashboardTemplate>
  )
}
