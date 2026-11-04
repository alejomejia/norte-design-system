import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Feedback/Alert',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Alert' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: "A message inside the page that stays until it's dealt with." } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
