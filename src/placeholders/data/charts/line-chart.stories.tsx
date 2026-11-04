import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Data/Charts/Line chart',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Line chart' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'A value over time, like runs per day or cost per week.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
