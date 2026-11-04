import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Pages/Workspace/Agents',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Agents' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'The agents of a workspace and what each one is allowed to do.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
