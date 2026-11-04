import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'AI/Sources/Citation',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Citation' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'A numbered link from an answer to the source it came from.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
