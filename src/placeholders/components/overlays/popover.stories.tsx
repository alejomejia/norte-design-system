import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Overlays/Popover',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Popover' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Extra content anchored to an element, like a filter or a preview.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
