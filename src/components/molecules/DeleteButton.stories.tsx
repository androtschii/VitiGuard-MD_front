import type { Meta, StoryObj } from '@storybook/react-vite'
import { DeleteButton } from './DeleteButton'

const meta = {
  title: 'Молекулы/DeleteButton',
  component: DeleteButton,
  args: { children: 'Удалить' },
} satisfies Meta<typeof DeleteButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Deleting: Story = {
  args: { isLoading: true },
}
