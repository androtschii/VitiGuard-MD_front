import { Link } from 'react-router'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'

export function NotFoundPage() {
  return (
    <CenteredTemplate>
      <p className="text-6xl font-semibold text-emerald-800">404</p>
      <h1 className="text-2xl font-semibold text-stone-900">
        Страница не найдена
      </h1>
      <p className="max-w-md text-stone-600">
        Возможно, адрес набран с ошибкой или страница была перенесена.
      </p>
      <Link
        to="/"
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
      >
        На главную
      </Link>
    </CenteredTemplate>
  )
}
