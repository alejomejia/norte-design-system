import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PLANNED_DOCS, PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Conversation/Streaming text',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Streaming text' },
  parameters: {
    controls: { disable: true },
    docs: {
      ...PLANNED_DOCS,
      description: {
        component:
          "An agent's answer as it arrives, readable while it streams and announced to screen readers without repeating itself.",
      },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
