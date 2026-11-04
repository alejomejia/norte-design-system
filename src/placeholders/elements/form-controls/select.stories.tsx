import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Form controls/Select',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Select' },
  parameters: {
    controls: { disable: true },
    // A planned component has no code to show and one section, so no page index either.
    docs: {
      canvas: { sourceState: 'none' },
      toc: { disable: true },
      description: { component: 'One option from a list, opened with the keyboard or the pointer.' },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
