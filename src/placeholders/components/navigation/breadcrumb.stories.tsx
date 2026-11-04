import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Navigation/Breadcrumb',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Breadcrumb' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Where a page sits, and the way back up.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
