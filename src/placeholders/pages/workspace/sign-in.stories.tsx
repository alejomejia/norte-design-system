import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Pages/Workspace/Sign in',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Sign in' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'The way in.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
