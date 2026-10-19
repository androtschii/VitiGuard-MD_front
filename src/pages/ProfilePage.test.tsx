import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { ProfilePage } from './ProfilePage'
import { sidebarLink } from '@/test/nav'

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={['/profile']}>
      <ProfilePage />
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  it('загружает профиль и показывает настройки интерфейса', async () => {
    server.use(
      http.get('/api/v1/users/me', () =>
        HttpResponse.json({
          id: 'user-1',
          email: 'ion@example.md',
          full_name: 'Ион',
          role: 'user',
          is_active: true,
          created_at: '2026-06-01T00:00:00Z',
          updated_at: '2026-06-01T00:00:00Z',
        }),
      ),
    )
    renderPage()

    expect(await screen.findByText('ion@example.md')).toBeInTheDocument()
    expect(screen.getByLabelText(/Имя/)).toHaveValue('Ион')
    expect(
      screen.getByRole('heading', { name: 'Интерфейс' }),
    ).toBeInTheDocument()
    expect(sidebarLink('Профиль')).toHaveAttribute('aria-current', 'page')
  })

  it('сообщает, если профиль не загрузился', async () => {
    server.use(
      http.get('/api/v1/users/me', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить профиль',
    )
  })
})
