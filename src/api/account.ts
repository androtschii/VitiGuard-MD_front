import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { parseFilenameFromDisposition } from './reports'
import { saveBlob } from '@/lib/mapImage'
import { localToday } from '@/lib/riskSeries'
import { useSessionStore } from '@/store/session'

// Скачивание архива всех данных пользователя в формате JSON (GET /users/me/export)
export async function downloadMyData(): Promise<string> {
  const response = await api.get<Blob>('/users/me/export', {
    responseType: 'blob',
  })
  const disposition =
    typeof response.headers?.get === 'function'
      ? response.headers.get('content-disposition')
      : (response.headers?.['content-disposition'] as string | undefined)
  const filename = parseFilenameFromDisposition(
    disposition,
    `vitiguard-data-${localToday()}.json`,
  )
  saveBlob(response.data, filename)
  return filename
}

export function useDownloadMyData() {
  return useMutation({
    mutationFn: downloadMyData,
  })
}

// Удаление аккаунта и связанных данных (DELETE /users/me). Сервер требует текущий
// пароль. _retried: на 401 «неверный пароль» клиент не обновляет токен и не
// выходит из сессии, а показывает ошибку в диалоге
export async function deleteAccount(password: string): Promise<void> {
  await api.delete('/users/me', {
    data: { password },
    _retried: true,
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear()
      useSessionStore.getState().clear()
    },
  })
}
