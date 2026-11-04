import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Overlays/Dialog',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Dialog' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: 'A focused task or a decision on top of the page. Focus stays inside until it closes.',
      },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
