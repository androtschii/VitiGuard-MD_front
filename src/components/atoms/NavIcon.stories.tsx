import type { Meta, StoryObj } from '@storybook/react-vite'
import { NavIcon } from './NavIcon'

const meta = {
  title: 'Атомы/NavIcon',
  component: NavIcon,
  args: { href: '/map' },
} satisfies Meta<typeof NavIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Map: Story = {}

export const Home: Story = {
  args: { href: '/' },
}
