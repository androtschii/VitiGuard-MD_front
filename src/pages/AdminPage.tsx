import { useDeferredValue, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminUsers, useSendPasswordReset, useUpdateUser } from '@/api/admin'
import { ApiError } from '@/api/client'
import { useMe, type CurrentUser, type UserRole } from '@/api/users'
import { useNavItems } from '@/app/navigation'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { Pagination } from '@/components/molecules/Pagination'
import { DataTable, type Column } from '@/components/organisms/DataTable'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

const ROLES: UserRole[] = ['user', 'agronomist', 'admin']

// Пользователи и роли (pr-091). Сервер пускает сюда только администратора;
// свою роль и доступ администратор не меняет — так он не запрёт себя снаружи
export function AdminPage() {
  const { t, i18n } = useTranslation()
  const navItems = useNavItems()

  useDocumentTitle(t('admin.title'))
  const searchId = useId()
  const me = useMe()
  const [search, setSearch] = useState('')
  const query = useDeferredValue(search.trim())
  const [page, setPage] = useState(1)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const users = useAdminUsers(query, page)
  const update = useUpdateUser()
  const reset = useSendPasswordReset()
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
  })

  const isSelf = (user: CurrentUser) => user.id === me.data?.id

  const renderActions = (user: CurrentUser, isMobile = false) => (
    <span className="flex flex-wrap items-center gap-2">
      <span className={user.is_active ? 'text-ink' : 'text-danger'}>
        {user.is_active ? t('admin.active') : t('admin.blocked')}
      </span>
      {!isSelf(user) && (
        <>
          {user.is_active ? (
            confirmingId === user.id ? (
              <>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={update.isPending}
                  onClick={() => {
                    update.mutate({ id: user.id, is_active: false })
                    setConfirmingId(null)
                  }}
                >
                  {t('admin.confirmBlock')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmingId(null)}
                >
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                disabled={update.isPending}
                aria-label={
                  isMobile
                    ? undefined
                    : t('admin.blockUser', { email: user.email })
                }
                onClick={() => setConfirmingId(user.id)}
              >
                {t('admin.block')}
              </Button>
            )
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled={update.isPending}
              aria-label={
                isMobile
                  ? undefined
                  : t('admin.unblockUser', { email: user.email })
              }
              onClick={() => {
                update.mutate({ id: user.id, is_active: true })
                setConfirmingId(null)
              }}
            >
              {t('admin.unblock')}
            </Button>
          )}
        </>
      )}
      {user.is_active && !isSelf(user) && (
        <Button
          size="sm"
          variant="ghost"
          disabled={reset.isPending}
          aria-label={
            isMobile ? undefined : t('admin.resetUser', { email: user.email })
          }
          onClick={() => reset.mutate(user.id)}
        >
          {reset.isSuccess && reset.variables === user.id
            ? t('admin.resetSent')
            : t('admin.reset')}
        </Button>
      )}
    </span>
  )

  const columns: Column<CurrentUser>[] = [
    {
      key: 'email',
      header: t('admin.user'),
      cell: (user) => (
        <span className="flex flex-col">
          <span className="text-ink">{user.full_name ?? '—'}</span>
          <span className="text-xs text-ink-muted">{user.email}</span>
        </span>
      ),
      sortValue: (user) => user.email,
    },
    {
      key: 'role',
      header: t('admin.role'),
      cell: (user) => (
        // Узкий столбец на телефоне сжимал поле до одной стрелки: название роли
        // не помещалось. Таблица прокручивается вбок, поэтому ширину держим
        <Select
          className="min-w-40"
          aria-label={t('admin.roleOf', { email: user.email })}
          value={user.role}
          disabled={isSelf(user) || update.isPending}
          onChange={(event) =>
            update.mutate({
              id: user.id,
              role: event.target.value as UserRole,
            })
          }
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`admin.roles.${role}`)}
            </option>
          ))}
        </Select>
      ),
    },
    {
      key: 'created',
      header: t('admin.created'),
      cell: (user) => date.format(new Date(user.created_at)),
      sortValue: (user) => user.created_at,
    },
    {
      key: 'access',
      header: t('admin.access'),
      cell: (user) => renderActions(user),
    },
  ]

  const forbidden =
    users.error instanceof ApiError && users.error.status === 403

  if (forbidden) {
    return (
      <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
        <h1 className="mb-1 text-xl font-semibold text-ink">
          {t('admin.title')}
        </h1>
        <p role="alert" className="text-sm text-danger">
          {t('admin.forbidden')}
        </p>
      </DashboardTemplate>
    )
  }

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-1 text-xl font-semibold text-ink">
        {t('admin.title')}
      </h1>
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">
        {t('admin.intro')}
      </p>
      <p className="mb-4 max-w-2xl text-xs text-ink-subtle">
        {t('admin.passwords')}
      </p>
      <div className="mb-3 flex max-w-sm flex-col gap-1">
        <label htmlFor={searchId} className="text-sm text-ink-soft">
          {t('admin.search')}
        </label>
        <Input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>
      {users.isError ? (
        <p role="alert" className="text-sm text-danger">
          {users.error.message}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {users.data?.items.map((user) => (
              <article
                key={user.id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink">
                      {user.full_name ?? '—'}
                    </span>
                    <span className="text-xs text-ink-muted">{user.email}</span>
                  </div>
                  <span className="text-xs text-ink-subtle">
                    {date.format(new Date(user.created_at))}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`role-mobile-${user.id}`}
                    className="text-xs text-ink-muted"
                  >
                    {t('admin.role')}
                  </label>
                  <Select
                    id={`role-mobile-${user.id}`}
                    aria-label={t('admin.role')}
                    value={user.role}
                    disabled={isSelf(user) || update.isPending}
                    onChange={(event) =>
                      update.mutate({
                        id: user.id,
                        role: event.target.value as UserRole,
                      })
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {t(`admin.roles.${role}`)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="border-t border-line pt-2">
                  {renderActions(user, true)}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden sm:block">
            <DataTable
              caption={t('admin.title')}
              columns={columns}
              rows={users.data?.items ?? []}
              getRowKey={(user) => user.id}
              isLoading={users.isPending}
              emptyMessage={t('admin.empty')}
            />
          </div>
          {reset.isError && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {reset.error.message}
            </p>
          )}
          {update.isError && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {update.error.message}
            </p>
          )}
          <div className="mt-4">
            <Pagination
              page={page}
              pageCount={users.data?.pages ?? 1}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </DashboardTemplate>
  )
}
