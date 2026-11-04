import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Data/Charts/Bar chart',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Bar chart' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Values side by side, like runs per agent.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
