import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Sources/Source list',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Source list' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'The sources an answer used, with the passages that back it up.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
