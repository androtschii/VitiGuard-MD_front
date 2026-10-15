import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataTable, type Column } from './DataTable'

type Vineyard = { id: string; name: string; area: number }

const columns: Column<Vineyard>[] = [
  { key: 'name', header: 'Название', cell: (row) => row.name },
  {
    key: 'area',
    header: 'Площадь, га',
    cell: (row) => row.area,
    align: 'right',
  },
]

const rows: Vineyard[] = [
  { id: '1', name: 'Криково', area: 1.7 },
  { id: '2', name: 'Пуркары', area: 4.2 },
]

function renderTable(
  props: Partial<Parameters<typeof DataTable<Vineyard>>[0]> = {},
) {
  return render(
    <DataTable
      caption="Участки"
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      {...props}
    />,
  )
}

describe('DataTable', () => {
  it('подписана через caption, заголовки столбцов привязаны к столбцам', () => {
    renderTable()

    expect(screen.getByRole('table', { name: 'Участки' })).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Название' }),
    ).toHaveAttribute('scope', 'col')
  })

  it('выводит строки через функции ячеек', () => {
    renderTable()
    const bodyRows = screen.getAllByRole('row').slice(1)

    expect(bodyRows).toHaveLength(2)
    expect(within(bodyRows[0]).getByText('Криково')).toBeInTheDocument()
    expect(within(bodyRows[1]).getByText('4.2')).toHaveClass('text-right')
  })

  it('без строк показывает сообщение на всю ширину', () => {
    renderTable({ rows: [], emptyMessage: 'Участков пока нет' })

    expect(screen.getByText('Участков пока нет')).toHaveAttribute(
      'colspan',
      '2',
    )
  })

  it('при загрузке показывает скелетоны и сообщает о загрузке', () => {
    renderTable({ isLoading: true })

    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Загрузка…')
    expect(screen.queryByText('Криково')).not.toBeInTheDocument()
  })

  it('без своего сообщения пишет, что данных нет', () => {
    renderTable({ rows: [] })

    expect(screen.getByText('Нет данных')).toBeInTheDocument()
  })

  describe('сортировка', () => {
    const sortable: Column<Vineyard>[] = [
      { ...columns[0], sortValue: (row) => row.name },
      { ...columns[1], sortValue: (row) => row.area },
    ]
    const many: Vineyard[] = [
      { id: '1', name: 'Пуркары', area: 4.2 },
      { id: '2', name: 'Bălți', area: 0.5 },
      { id: '3', name: 'Криково', area: 1.7 },
      { id: '4', name: 'Basarabeasca', area: 12 },
    ]
    const names = () =>
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[0].textContent)

    it('без начальной сортировки оставляет порядок строк', () => {
      renderTable({ columns: sortable, rows: many })

      expect(names()).toEqual(['Пуркары', 'Bălți', 'Криково', 'Basarabeasca'])
      expect(
        screen.getByRole('columnheader', { name: 'Название' }),
      ).toHaveAttribute('aria-sort', 'none')
    })

    it('сортирует по числам и меняет направление повторным нажатием', async () => {
      const user = userEvent.setup()
      renderTable({
        columns: sortable,
        rows: many,
        initialSort: { key: 'area', direction: 'descending' },
      })
      const header = screen.getByRole('columnheader', { name: /Площадь/ })

      expect(header).toHaveAttribute('aria-sort', 'descending')
      expect(names()).toEqual(['Basarabeasca', 'Пуркары', 'Криково', 'Bălți'])

      await user.click(within(header).getByRole('button'))

      expect(header).toHaveAttribute('aria-sort', 'ascending')
      expect(names()).toEqual(['Bălți', 'Криково', 'Пуркары', 'Basarabeasca'])
    })

    it('строки сравнивает по правилам языка', async () => {
      const user = userEvent.setup()
      renderTable({ columns: sortable, rows: many })

      await user.click(screen.getByRole('button', { name: 'Название' }))

      // В русском кириллица идёт раньше латиницы, а «ă» стоит рядом с «a»
      expect(names()).toEqual(['Криково', 'Пуркары', 'Bălți', 'Basarabeasca'])
    })

    it('столбец без значения сортировки — обычный заголовок', () => {
      renderTable({
        initialSort: { key: 'name', direction: 'ascending' },
      })

      expect(
        screen.getByRole('columnheader', { name: 'Название' }),
      ).not.toHaveAttribute('aria-sort')
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(names()).toEqual(['Криково', 'Пуркары'])
    })
  })
})
