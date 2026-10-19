import { useEffect, useMemo } from 'react'

// Ссылка blob: на выбранный файл для <img>. Ссылка держит файл в памяти вкладки,
// пока её не освободить, поэтому она освобождается при смене файла и уходе
export function useObjectUrl(file: Blob | null | undefined) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )
  return url
}
