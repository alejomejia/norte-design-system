import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Overlays/Menu',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Menu' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'A list of actions opened from a button.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
