import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Overlays/Popover',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Popover' },
  parameters: {
    controls: { disable: true },
    // A planned component has no code to show and one section, so no page index either.
    docs: {
      canvas: { sourceState: 'none' },
      toc: { disable: true },
      description: { component: 'Extra content anchored to an element, like a filter or a preview.' },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
