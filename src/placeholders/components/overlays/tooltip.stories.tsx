import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Overlays/Tooltip',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Tooltip' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'The name or shortcut of a control, on hover and on focus.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
