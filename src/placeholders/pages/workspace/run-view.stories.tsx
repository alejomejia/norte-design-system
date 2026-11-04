import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Pages/Workspace/Run view',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Run view' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'One run, start to finish: the conversation, the steps and the approvals.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
