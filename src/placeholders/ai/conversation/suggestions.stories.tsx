import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Conversation/Suggestions',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Suggestions' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Next prompts to choose from, so an empty conversation has a way to start.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
