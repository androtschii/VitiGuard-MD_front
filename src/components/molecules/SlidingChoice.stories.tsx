import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlidingChoice } from './SlidingChoice'

const meta = {
  title: 'Молекулы/SlidingChoice',
  component: SlidingChoice,
  args: {
    label: 'Язык',
    value: 'ru',
    options: [
      { value: 'ru', label: 'Русский', content: 'RU' },
      { value: 'ro', label: 'Română', content: 'RO' },
      { value: 'en', label: 'English', content: 'EN' },
    ],
    onChange: () => {},
  },
} satisfies Meta<typeof SlidingChoice>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
