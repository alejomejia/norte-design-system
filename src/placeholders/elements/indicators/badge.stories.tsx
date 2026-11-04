import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Indicators/Badge',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Badge' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'A short label for a status or a count.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
