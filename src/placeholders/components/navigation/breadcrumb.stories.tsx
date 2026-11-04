import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Navigation/Breadcrumb',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Breadcrumb' },
  parameters: {
    controls: { disable: true },
    // A planned component has no code to show and one section, so no page index either.
    docs: {
      canvas: { sourceState: 'none' },
      toc: { disable: true },
      description: { component: 'Where a page sits, and the way back up.' },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
