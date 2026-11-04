import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Media/Icon',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Icon' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: "One icon of Norte's set, as an inline SVG that takes the color of its text." } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
