import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PLANNED_DOCS, PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Conversation/Prompt input',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Prompt input' },
  parameters: {
    controls: { disable: true },
    docs: {
      ...PLANNED_DOCS,
      description: {
        component: 'Where a person writes to an agent: it grows with the text, takes attachments, and sends with ⌘↵.',
      },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
