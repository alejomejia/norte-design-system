import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Agents/Run status',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Run status' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Where a run is: queued, running, waiting for approval, done or failed.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
