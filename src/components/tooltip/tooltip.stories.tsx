import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/button'
import { IconButton } from '@/components/icon-button'

import { Tooltip, TooltipProvider } from '.'
import { TOOLTIP_ALIGNS, TOOLTIP_SIDES } from './tooltip.const'

/** Where each side's button sits in the Sides story's cross. */
const SIDE_CELLS = {
  top: 'col-start-2 row-start-1',
  right: 'col-start-3 row-start-2',
  bottom: 'col-start-2 row-start-3',
  left: 'col-start-1 row-start-2',
} as const satisfies Record<(typeof TOOLTIP_SIDES)[number], string>

const meta = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  tags: ['beta'],
  argTypes: {
    content: { control: 'text' },
    side: { control: 'inline-radio', options: TOOLTIP_SIDES },
    align: { control: 'inline-radio', options: TOOLTIP_ALIGNS },
    delay: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
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
          "A short label for what an icon alone can't say, with its shortcut if it has one, shown on hover and focus. Inside `TooltipProvider`, neighbors open at once after the first. Idea from React Bits' Warm Tooltip.",
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
 * On every side: `top` by default, then `right`, `bottom` and `left`. Each slides out from its trigger, and flips to
 * the other side when there's no room. Hover each button.
 */
export const Sides: Story = {
  // The full width, not `centered`, which shrinks the frame to the buttons: the tooltips need room beside them.
  parameters: { layout: 'padded', controls: { include: ['align'] } },
  // A tight cross, each button with open space on its own side, so no tooltip covers a neighbor and each fits even in a
  // phone-wide frame.
  render: (args) => (
    <div className="mx-auto grid w-fit grid-cols-3 place-items-center gap-x-4 gap-y-10 py-12">
      {TOOLTIP_SIDES.map((side) => (
        <Tooltip key={side} content={`On the ${side}`} side={side} align={args.align}>
          <Button variant="secondary" size="s" className={SIDE_CELLS[side]}>
            {side.charAt(0).toUpperCase() + side.slice(1)}
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    for (const side of TOOLTIP_SIDES) {
      await step(`${side}: it opens on that side`, async () => {
        await userEvent.hover(canvas.getByRole('button', { name: side.charAt(0).toUpperCase() + side.slice(1) }))
        await waitFor(() =>
          expect(page.getByText(`On the ${side}`).closest('[data-side]')).toHaveAttribute('data-side', side),
        )
        await userEvent.unhover(canvas.getByRole('button', { name: side.charAt(0).toUpperCase() + side.slice(1) }))
      })
    }
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

/** A disabled button gets no hover or focus, so set `focusableWhenDisabled` on it to keep its tooltip. */
export const OnADisabledButton: Story = {
  name: 'On a disabled button',
  args: {
    content: 'Send',
    shortcut: ['↵'],
    children: <IconButton icon="send" label="Send" variant="primary" disabled focusableWhenDisabled />,
  },
  play: async ({ canvas, canvasElement, step }) => {
    await step('Hovering the disabled button opens its tooltip', async () => {
      await userEvent.hover(canvas.getByRole('button', { name: 'Send' }))
      const page = within(canvasElement.ownerDocument.body)
      await waitFor(() => expect(page.getByText('Send')).toBeVisible())
    })
  },
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
