import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PLANNED_DOCS, PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Actions/Icon button',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Icon button' },
  parameters: {
    controls: { disable: true },
    docs: {
      ...PLANNED_DOCS,
      description: {
        component:
          'A button that only shows an icon, for toolbars and dense rows. It always has an accessible name and a tooltip.',
      },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
