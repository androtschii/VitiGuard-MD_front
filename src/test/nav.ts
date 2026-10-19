import { screen, within } from '@testing-library/react'

// Ссылка раздела в боковой колонке. В jsdom нет стилей, поэтому нижняя
// панель телефона тоже на странице, и каждая ссылка раздела в ней повторяется
export function sidebarLink(name: string) {
  const [sidebar] = screen.getAllByRole('navigation', {
    name: 'Основная навигация',
  })
  if (!sidebar) throw new Error('нет навигации')
  return within(sidebar).getByRole('link', { name })
}
