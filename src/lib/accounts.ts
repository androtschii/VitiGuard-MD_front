// Аккаунты, в которые входили на этом устройстве: для быстрого переключения в
// меню профиля. Хранятся только email, имя и роль — без паролей и токенов,
// поэтому переключение всё равно требует пароля (email подставляется сам)
export type KnownAccount = {
  email: string
  name: string | null
  role: 'user' | 'agronomist' | 'admin'
}

const KEY = 'vitiguard.accounts'
export const MAX_ACCOUNTS = 5

export function listAccounts(): KnownAccount[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is KnownAccount =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as KnownAccount).email === 'string',
        )
      : []
  } catch {
    return []
  }
}

function save(accounts: KnownAccount[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(accounts))
  } catch {
    // Хранилище недоступно (приватный режим): переключатель просто пустой
  }
}

// Последний вошедший — первым в списке
export function rememberAccount(account: KnownAccount) {
  const others = listAccounts().filter((item) => item.email !== account.email)
  save([account, ...others].slice(0, MAX_ACCOUNTS))
}

export function forgetAccount(email: string) {
  save(listAccounts().filter((item) => item.email !== email))
}
