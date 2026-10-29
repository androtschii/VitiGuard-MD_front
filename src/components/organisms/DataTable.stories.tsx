import type { Meta, StoryObj } from '@storybook/react-vite'
import { RiskBadge } from '@/components/molecules/RiskBadge'
import { DataTable, type Column } from './DataTable'

type Plot = {
  id: string
  name: string
  area: number
  risk: 'low' | 'medium' | 'high'
}

const plots: Plot[] = [
  { id: '1', name: 'Криково, северный склон', area: 13.6, risk: 'high' },
  { id: '2', name: 'Пуркарь у реки', area: 8.2, risk: 'medium' },
  { id: '3', name: 'Кахул, новый', area: 5.6, risk: 'low' },
]

const columns: Column<Plot>[] = [
  {
    key: 'name',
    header: 'Участок',
    cell: (plot) => plot.name,
    sortValue: (plot) => plot.name,
  },
  {
    key: 'area',
    header: 'Площадь, га',
    align: 'right',
    cell: (plot) => plot.area.toLocaleString('ru'),
    sortValue: (plot) => plot.area,
  },
  {
    key: 'risk',
    header: 'Риск',
    cell: (plot) => <RiskBadge level={plot.risk} />,
  },
]

function Plots(props: {
  rows: Plot[]
  isLoading?: boolean
  emptyMessage?: string
  sortByArea?: boolean
}) {
  return (
    <DataTable
      caption="Участки хозяйства"
      columns={columns}
      rows={props.rows}
      getRowKey={(plot) => plot.id}
      isLoading={props.isLoading}
      emptyMessage={props.emptyMessage}
      initialSort={
        props.sortByArea ? { key: 'area', direction: 'descending' } : undefined
      }
    />
  )
}

// Таблица с сортировкой по заголовку, заглушками загрузки и пустым состоянием
const meta = {
  title: 'Организмы/DataTable',
  component: Plots,
  args: { rows: plots },
} satisfies Meta<typeof Plots>

export default meta
type Story = StoryObj<typeof meta>

export const Rows: Story = {}

export const SortedByArea: Story = { args: { sortByArea: true } }

export const Loading: Story = { args: { rows: [], isLoading: true } }

export const Empty: Story = {
  args: { rows: [], emptyMessage: 'Участков пока нет.' },
}
