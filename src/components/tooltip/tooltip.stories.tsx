import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { IconButton } from '@/components/icon-button'

import { Tooltip, TooltipProvider } from '.'
import { TOOLTIP_SIDES } from './tooltip.const'

const meta = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  tags: ['beta'],
  argTypes: {
    content: { control: 'text' },
    side: { control: 'inline-radio', options: TOOLTIP_SIDES },
    children: { table: { disable: true } },
  },
  args: { content: 'Copy output', children: <IconButton icon="copy" label="Copy output" /> },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="sb-row">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  parameters: {
    // Room above the trigger, where the tooltip opens.
    layout: 'centered',
    docs: {
      description: {
        component:
          "A short label that appears when a control is hovered or focused, for what an icon alone can't say, with its shortcut if it has one. Inside `TooltipProvider`, tooltips warm up: the first one waits a moment, and its neighbors then open at once. Idea from React Bits' Warm Tooltip.",
      },
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** With the action's keyboard shortcut, in a key cap turned to the tooltip's colors. */
export const WithShortcut: Story = {
  name: 'With a shortcut',
  args: {
    content: 'Run agent',
    shortcut: ['⌘', '↵'],
    children: <IconButton icon="run" label="Run agent" variant="primary" />,
  },
}

/**
 * A toolbar: the first tooltip waits, then run the pointer along the buttons and each label opens at once, without its
 * animation, while the group is warm.
 */
export const Warm: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <>
      <Tooltip content="Copy output" shortcut={['⌘', 'C']}>
        <IconButton size="s" icon="copy" label="Copy output" />
      </Tooltip>
      <Tooltip content="Run again" shortcut={['⌘', 'R']}>
        <IconButton size="s" icon="retry" label="Run again" />
      </Tooltip>
      <Tooltip content="Edit instructions">
        <IconButton size="s" icon="edit" label="Edit instructions" />
      </Tooltip>
      <Tooltip content="More actions">
        <IconButton size="s" icon="more" label="More actions" />
      </Tooltip>
    </>
  ),
}

/** It opens on keyboard focus too, not only on hover. */
export const OnFocus: Story = {
  name: 'On focus',
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement, step }) => {
    await step('Tabbing to the button opens its tooltip', async () => {
      await userEvent.tab()
      const page = within(canvasElement.ownerDocument.body)
      await waitFor(() => expect(page.getByText('Copy output')).toBeVisible())
    })
  },
}
