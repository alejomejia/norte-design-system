import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Components/Content/Accordion',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Accordion' },
  parameters: {
    controls: { disable: true },
    docs: { description: { component: 'Sections that open and close, so long content stays scannable.' } },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
