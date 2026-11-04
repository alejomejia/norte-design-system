import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Feedback/Empty state',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Empty state' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: 'What a list or a page shows before there is anything in it, and the first step to fill it.',
      },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
