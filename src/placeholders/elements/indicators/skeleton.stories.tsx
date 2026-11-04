import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Indicators/Skeleton',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Skeleton' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'The shape of the content while it loads.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
