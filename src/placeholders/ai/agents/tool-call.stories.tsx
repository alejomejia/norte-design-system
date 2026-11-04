import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Agents/Tool call',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Tool call' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: 'A step an agent took: the tool, what it sent and what came back, folded until you need the detail.',
      },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
