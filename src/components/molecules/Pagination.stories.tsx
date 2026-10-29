import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Pagination } from './Pagination'

const meta = {
  title: 'Молекулы/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 12, onPageChange: () => undefined },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

function Interactive(args: { page: number; pageCount: number }) {
  const [page, setPage] = useState(args.page)
  return (
    <Pagination page={page} pageCount={args.pageCount} onPageChange={setPage} />
  )
}

// Многоточие вместо далёких страниц; текущая отмечена для экранных дикторов
export const Paging: Story = { render: (args) => <Interactive {...args} /> }

export const Middle: Story = { args: { page: 6 } }

// На одной странице листать нечего — компонент ничего не рисует
export const SinglePage: Story = { args: { pageCount: 1 } }
