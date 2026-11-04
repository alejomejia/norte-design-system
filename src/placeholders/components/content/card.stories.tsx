import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Content/Card',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Card' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'A group of related content with a border, like an agent in a list.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
