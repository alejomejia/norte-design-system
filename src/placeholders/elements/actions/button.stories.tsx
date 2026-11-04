import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PlannedComponent } from '@/handbook/placeholders/planned-component'

const meta = {
  title: 'Elements/Actions/Button',
  component: PlannedComponent,
  tags: ['planned'],
  args: { name: 'Button' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Starts an action. `primary` for the main one on a screen, `secondary` beside it, `ghost` for quiet ones in toolbars and lists, and `danger` for what can't be undone. While an async action runs, it keeps its width and shows a spinner.",
      },
    },
  },
} satisfies Meta<typeof PlannedComponent>

export default meta

export const Placeholder: StoryObj<typeof meta> = {}
