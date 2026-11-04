import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Actions/Link',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Link' },
  parameters: {
    controls: { disable: true },
    // A planned component has no code to show and one section, so no page index either.
    docs: {
      canvas: { sourceState: 'none' },
      toc: { disable: true },
      description: { component: 'Text that takes you somewhere: to a run, a document, an outside page.' },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
