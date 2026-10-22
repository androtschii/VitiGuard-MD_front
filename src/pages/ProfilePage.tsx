import { useTranslation } from 'react-i18next'
import { useMe } from '@/api/users'
import { useNavItems } from '@/app/navigation'
import { CardSkeleton } from '@/components/molecules/CardSkeleton'
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/molecules/ThemeSwitcher'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { NotificationSettings } from '@/components/organisms/NotificationSettings'
import { ProfileForm } from '@/components/organisms/ProfileForm'
import { TelegramConnect } from '@/components/organisms/TelegramConnect'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

const card = 'rounded-lg border border-line bg-surface p-4 shadow-sm'

export function ProfilePage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const me = useMe()

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-xl font-semibold text-ink">{t('profile.title')}</h1>
        <section aria-labelledby="profile-account" className={card}>
          <h2
            id="profile-account"
            className="mb-3 text-base font-semibold text-ink"
          >
            {t('profile.account')}
          </h2>
          {me.isPending && <CardSkeleton />}
          {me.isError && (
            <p role="alert" className="text-sm text-danger">
              {t('profile.loadError')}
            </p>
          )}
          {/* key: после загрузки форма начинается с имени из профиля */}
          {me.data && <ProfileForm key={me.data.id} user={me.data} />}
        </section>
        <section aria-labelledby="profile-notifications" className={card}>
          <h2
            id="profile-notifications"
            className="mb-1 text-base font-semibold text-ink"
          >
            {t('notifications.title')}
          </h2>
          <NotificationSettings />
        </section>
        <section aria-labelledby="profile-telegram" className={card}>
          <h2
            id="profile-telegram"
            className="mb-1 text-base font-semibold text-ink"
          >
            {t('telegram.title')}
          </h2>
          <TelegramConnect />
        </section>
        <section aria-labelledby="profile-interface" className={card}>
          <h2
            id="profile-interface"
            className="mb-1 text-base font-semibold text-ink"
          >
            {t('profile.interface')}
          </h2>
          <p className="mb-3 text-sm text-ink-muted">
            {t('profile.interfaceHint')}
          </p>
          <div className="flex flex-wrap gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </section>
      </div>
    </DashboardTemplate>
  )
}
