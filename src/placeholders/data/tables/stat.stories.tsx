import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Data/Tables/Stat',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Stat' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'One number that matters, with its trend.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
