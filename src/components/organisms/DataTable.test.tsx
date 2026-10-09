import { render, screen, within } from '@testing-library/react'
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
})
