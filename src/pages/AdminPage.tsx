import { useDeferredValue, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminUsers, useUpdateUser } from '@/api/admin'
import { useMe, type CurrentUser, type UserRole } from '@/api/users'
import { useNavItems } from '@/app/navigation'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { Pagination } from '@/components/molecules/Pagination'
import { DataTable, type Column } from '@/components/organisms/DataTable'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

const ROLES: UserRole[] = ['user', 'agronomist', 'admin']

// Пользователи и роли (pr-091). Сервер пускает сюда только администратора;
// свою роль и доступ администратор не меняет — так он не запрёт себя снаружи
export function AdminPage() {
  const { t, i18n } = useTranslation()
  const navItems = useNavItems()
  const searchId = useId()
  const me = useMe()
  const [search, setSearch] = useState('')
  const query = useDeferredValue(search.trim())
  const [page, setPage] = useState(1)
  const users = useAdminUsers(query, page)
  const update = useUpdateUser()
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
  })

  const isSelf = (user: CurrentUser) => user.id === me.data?.id
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
      cell: (user) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className={user.is_active ? 'text-ink' : 'text-danger'}>
            {user.is_active ? t('admin.active') : t('admin.blocked')}
          </span>
          {!isSelf(user) && (
            <Button
              size="sm"
              variant={user.is_active ? 'ghost' : 'secondary'}
              disabled={update.isPending}
              aria-label={t(
                user.is_active ? 'admin.blockUser' : 'admin.unblockUser',
                {
                  email: user.email,
                },
              )}
              onClick={() =>
                update.mutate({ id: user.id, is_active: !user.is_active })
              }
            >
              {user.is_active ? t('admin.block') : t('admin.unblock')}
            </Button>
          )}
        </span>
      ),
    },
  ]

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-1 text-xl font-semibold text-ink">
        {t('admin.title')}
      </h1>
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">
        {t('admin.intro')}
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
          <DataTable
            caption={t('admin.title')}
            columns={columns}
            rows={users.data?.items ?? []}
            getRowKey={(user) => user.id}
            isLoading={users.isPending}
            emptyMessage={t('admin.empty')}
          />
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
