import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Indicators/Keyboard key',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Keyboard key' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'A key or a shortcut, like ⌘K, written the way it looks on a keyboard.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
