import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { CurrentUser } from '@/api/users'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { ProfileForm } from './ProfileForm'

const user: CurrentUser = {
  id: 'user-1',
  email: 'ion@example.md',
  full_name: 'Ион',
  role: 'agronomist',
  is_active: true,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
}

describe('ProfileForm', () => {
  it('показывает email и роль и сохраняет новое имя', async () => {
    let body: unknown
    server.use(
      http.patch('/api/v1/users/me', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ ...user, full_name: 'Ион Попеску' })
      }),
    )
    renderWithQueryClient(<ProfileForm user={user} />)

    expect(screen.getByText('ion@example.md')).toBeInTheDocument()
    expect(screen.getByText('Агроном')).toBeInTheDocument()
    const save = screen.getByRole('button', { name: 'Сохранить' })
    expect(save).toBeDisabled()

    const name = screen.getByLabelText(/Имя/)
    await userEvent.clear(name)
    await userEvent.type(name, 'Ион Попеску')
    await userEvent.click(save)

    expect(await screen.findByText('Изменения сохранены')).toBeInTheDocument()
    expect(body).toEqual({ full_name: 'Ион Попеску' })
    expect(name).toHaveValue('Ион Попеску')
  })

  it('не отправляет слишком короткое имя', async () => {
    renderWithQueryClient(<ProfileForm user={{ ...user, full_name: null }} />)

    await userEvent.type(screen.getByLabelText(/Имя/), 'И')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByText('Введите имя')).toBeInTheDocument()
  })

  it('показывает ошибку сервера', async () => {
    server.use(
      http.patch('/api/v1/users/me', () =>
        HttpResponse.json({ detail: 'Сервис недоступен' }, { status: 503 }),
      ),
    )
    renderWithQueryClient(<ProfileForm user={user} />)

    await userEvent.type(screen.getByLabelText(/Имя/), 'ица')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сервис недоступен',
    )
  })

  it('без ответа сервера пишет общую ошибку', async () => {
    server.use(http.patch('/api/v1/users/me', () => HttpResponse.error()))
    renderWithQueryClient(<ProfileForm user={user} />)

    await userEvent.type(screen.getByLabelText(/Имя/), 'ица')
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
