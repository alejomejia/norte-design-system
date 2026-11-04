import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Indicators/Spinner',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Spinner' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: "Something is running and there's no telling how long it takes." } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
