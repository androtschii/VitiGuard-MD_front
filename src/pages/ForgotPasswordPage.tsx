import { useState } from 'react'
import { Link } from 'react-router'
import { useRequestPasswordReset } from '@/api/auth'
import { ForgotPasswordForm } from '@/components/organisms/ForgotPasswordForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'

const backToLogin = (
  <Link to="/login" className="font-medium text-emerald-800 underline">
    Вернуться ко входу
  </Link>
)

export function ForgotPasswordPage() {
  const { mutateAsync } = useRequestPasswordReset()
  const [sentTo, setSentTo] = useState<string | null>(null)

  return (
    <AuthTemplate title="Восстановление пароля" footer={backToLogin}>
      {sentTo === null ? (
        <ForgotPasswordForm
          onSubmit={async (values) => {
            await mutateAsync(values)
            setSentTo(values.email)
          }}
        />
      ) : (
        // Текст не подтверждает, что такой аккаунт есть: сервер отвечает одинаково
        // в любом случае, иначе по форме можно было бы узнавать зарегистрированные email
        <p role="status" className="text-sm text-stone-700">
          Если аккаунт с адресом <strong>{sentTo}</strong> существует, мы
          отправили на него письмо со ссылкой для создания нового пароля.
          Проверьте также папку «Спам».
        </p>
      )}
    </AuthTemplate>
  )
}
