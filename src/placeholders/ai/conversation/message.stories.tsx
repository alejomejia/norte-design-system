import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Conversation/Message',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Message' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'One turn of a conversation, from a person or an agent.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
