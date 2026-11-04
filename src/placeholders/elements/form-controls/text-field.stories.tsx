import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Form controls/Text field',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Text field' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'One line of text, with its label, hint and error.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
