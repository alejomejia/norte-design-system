import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Navigation/Command menu',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Command menu' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Every action and page, one search away (⌘K).' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
