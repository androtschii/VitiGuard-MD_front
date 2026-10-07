import { useApiInfo } from '@/api/info'

export function ApiStatus() {
  const { data, isPending, isError } = useApiInfo()

  if (isPending) {
    return (
      <p role="status" className="text-sm text-stone-500">
        Подключение к API…
      </p>
    )
  }
  if (isError) {
    return (
      <p role="status" className="text-sm text-red-700">
        API недоступен
      </p>
    )
  }
  return (
    <p role="status" className="text-sm text-stone-500">
      API {data.version}, окружение {data.environment}
    </p>
  )
}
