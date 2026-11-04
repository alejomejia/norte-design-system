import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Pages/Workspace/Sign in',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Sign in' },
  parameters: {
    controls: { disable: true },
    // A planned component has no code to show and one section, so no page index either.
    docs: { canvas: { sourceState: 'none' }, toc: { disable: true }, description: { component: 'The way in.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
