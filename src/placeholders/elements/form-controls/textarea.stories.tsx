import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Form controls/Textarea',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Textarea' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Several lines of text that grow with what you type.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
