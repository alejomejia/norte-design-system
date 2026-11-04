import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Media/Logo',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Logo' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: "Norte's mark and wordmark." } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
