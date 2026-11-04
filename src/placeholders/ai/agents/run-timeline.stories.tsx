import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Agents/Run timeline',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Run timeline' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Every step of a run in order, with its time and status.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
