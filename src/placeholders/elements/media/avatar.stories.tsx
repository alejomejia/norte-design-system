import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PLANNED_DOCS, PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Media/Avatar',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Avatar' },
  parameters: {
    controls: { disable: true },
    docs: {
      ...PLANNED_DOCS,
      description: {
        component: "A person or an agent: a photo, initials, or the agent's mark, so it's always clear who did what.",
      },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
