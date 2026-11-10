import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { sidebarLink } from '@/test/nav'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { VinePage } from './VinePage'

const row = new File(['row'], 'row.jpg', { type: 'image/jpeg' })

function renderPage() {
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/diagnosis/vine']}>
      <VinePage />
    </MemoryRouter>,
  )
  return userEvent.setup()
}

async function detect(user: ReturnType<typeof userEvent.setup>) {
  await user.upload(screen.getByLabelText('Выбрать фото ряда'), row)
  await user.click(
    screen.getByRole('button', { name: 'Найти стволы и грозди' }),
  )
}

describe('VinePage', () => {
  it('рисует рамки стволов и гроздей поверх фото', async () => {
    const user = renderPage()
    const button = screen.getByRole('button', { name: 'Найти стволы и грозди' })
    expect(button).toBeDisabled()
    expect(screen.getByText(/Выберите фото ряда и нажмите/)).toBeVisible()
    // Вкладка ряда выбрана, раздел «Диагностика» в меню выделен
    const tabs = screen.getByRole('navigation', { name: 'Что проверить' })
    expect(
      within(tabs).getByRole('link', { name: 'Ряд лозы' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(sidebarLink('Диагностика')).toHaveAttribute('aria-current', 'page')

    await detect(user)

    const boxes = await screen.findAllByTestId('vine-box')
    expect(boxes).toHaveLength(3)
    expect(boxes[0]).toHaveAttribute('title', 'Ствол, 81 %')
    expect(boxes[0]).toHaveStyle({ left: '14%', top: '68%' })
    // Рамка появляется, когда до неё доходит линия: задержка — верхний край
    expect(boxes[0]).toHaveClass('vine-box')
    expect(boxes[0]?.style.getPropertyValue('--vine-delay')).toBe('0.680')
    expect(boxes[1]).toHaveAttribute('title', 'Гроздь, 74 %')
    expect(screen.getByText(/Модель vine_yolo11n/)).toBeVisible()

    // Скрыть грозди — остаются только стволы
    const bunches = screen.getByRole('button', { name: 'Грозди: 1' })
    await user.click(bunches)
    expect(bunches).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getAllByTestId('vine-box')).toHaveLength(2)
    await user.click(bunches)

    // Порог уверенности убирает слабый ствол
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })
    expect(screen.getByText('Уверенность от 50 %')).toBeVisible()
    expect(screen.getAllByTestId('vine-box')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Стволы: 1' })).toBeVisible()
  })

  it('сообщает, что ничего не найдено, и показывает ошибку сервера', async () => {
    server.use(
      http.post('/api/v1/ai/vine/detect', () =>
        HttpResponse.json({
          model: 'vine_yolo11n',
          version: 'v',
          image_width: 10,
          image_height: 10,
          trunks: 0,
          bunches: 0,
          detections: [],
        }),
      ),
    )
    const user = renderPage()
    await detect(user)
    expect(
      await screen.findByText('Стволов и гроздей на фото не найдено.'),
    ).toBeVisible()

    server.use(
      http.post('/api/v1/ai/vine/detect', async () => {
        await delay(50)
        return HttpResponse.json(
          { detail: 'Модель лозы не загружена на сервер' },
          { status: 503 },
        )
      }),
    )
    // Новое фото сбрасывает прежний ответ
    await user.upload(screen.getByLabelText('Выбрать фото ряда'), row)
    expect(screen.getByText(/Выберите фото ряда и нажмите/)).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Найти стволы и грозди' }),
    )
    expect(screen.getByText('Ищем стволы и грозди…')).toBeVisible()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Модель лозы не загружена на сервер',
    )
  })
})
