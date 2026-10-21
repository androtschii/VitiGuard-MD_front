import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { NotificationSettings } from './NotificationSettings'

describe('NotificationSettings', () => {
  it('показывает текущий порог и сохраняет новый сразу', async () => {
    const sent: unknown[] = []
    server.use(
      http.put('/api/v1/users/me/notifications', async ({ request }) => {
        const body = (await request.json()) as { alert_level: unknown }
        sent.push(body)
        return HttpResponse.json(body)
      }),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<NotificationSettings />)

    expect(
      await screen.findByRole('radio', { name: /Только о высоком риске/ }),
    ).toBeChecked()
    await user.click(screen.getByRole('radio', { name: /О среднем и высоком/ }))

    expect(await screen.findByText('Сохранено')).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: /О среднем и высоком/ }),
    ).toBeChecked()

    await user.click(screen.getByRole('radio', { name: /Не предупреждать/ }))
    await waitFor(() =>
      expect(sent).toEqual([{ alert_level: 'medium' }, { alert_level: null }]),
    )
  })

  it('сообщает, если сохранить не удалось', async () => {
    server.use(
      http.put('/api/v1/users/me/notifications', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderWithQueryClient(<NotificationSettings />)

    await userEvent.click(
      await screen.findByRole('radio', { name: /Не предупреждать/ }),
    )

    expect(
      await screen.findByText('Не удалось сохранить. Попробуйте ещё раз.'),
    ).toBeInTheDocument()
  })

  it('сообщает, если настройки не загрузились', async () => {
    server.use(
      http.get('/api/v1/users/me/notifications', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderWithQueryClient(<NotificationSettings />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить настройки предупреждений',
    )
  })
})
