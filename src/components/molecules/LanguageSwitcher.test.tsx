import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LANGUAGE_STORAGE_KEY } from '@/i18n'
import { Pagination } from './Pagination'
import { LanguageSwitcher } from './LanguageSwitcher'

function renderWithPagination() {
  return render(
    <>
      <LanguageSwitcher />
      <Pagination page={1} pageCount={3} onPageChange={() => {}} />
    </>,
  )
}

describe('LanguageSwitcher', () => {
  it('показывает текущий язык', () => {
    renderWithPagination()

    expect(screen.getByLabelText('Язык')).toHaveValue('ru')
  })

  it('переводит интерфейс на румынский и запоминает выбор', async () => {
    renderWithPagination()

    await userEvent.selectOptions(screen.getByLabelText('Язык'), 'ro')

    expect(screen.getByLabelText('Limba')).toHaveValue('ro')
    expect(screen.getByRole('button', { name: 'Înainte' })).toBeInTheDocument()
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ro')
    expect(document.documentElement.lang).toBe('ro')
  })

  it('переводит интерфейс на английский', async () => {
    renderWithPagination()

    await userEvent.selectOptions(screen.getByLabelText('Язык'), 'en')

    expect(
      screen.getByRole('navigation', { name: 'Pages' }),
    ).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })
})
