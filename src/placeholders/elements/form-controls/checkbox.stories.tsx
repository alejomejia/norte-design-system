import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Form controls/Checkbox',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Checkbox' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'On or off for one option, or several options from a list.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
