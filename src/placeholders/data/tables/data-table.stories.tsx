import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Data/Tables/Data table',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Data table' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Rows to scan, sort and select, like a list of runs.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
