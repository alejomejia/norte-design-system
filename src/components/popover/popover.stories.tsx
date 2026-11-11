import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Card } from '@/components/card'
import { IconButton } from '@/components/icon-button'

import { Popover } from '.'
import { POPOVER_WIDTHS } from './popover.const'

/**
 * What run #128 spent, by step: they add up to its 38.2k tokens and $0.84. A function the stories call, not a
 * component, so the code panel shows the markup.
 */
function costBreakdown() {
  return (
    // No column gap: the numbers are padded instead, so the total's line runs across unbroken.
    <dl className="grid grid-cols-[1fr_auto_auto] gap-y-2 text-right tabular-nums">
      <dt className="text-left text-ink-muted">Planning and summary</dt>
      <dd className="pl-4">9.6k</dd>
      <dd className="pl-4">$0.46</dd>
      <dt className="text-left text-ink-muted">Reading pages</dt>
      <dd className="pl-4">28.6k</dd>
      <dd className="pl-4">$0.38</dd>
      <dt className="border-t border-line pt-2 text-left font-medium">Total</dt>
      <dd className="border-t border-line pt-2 pl-4 font-medium">38.2k</dd>
      <dd className="border-t border-line pt-2 pl-4 font-medium">$0.84</dd>
    </dl>
  )
}

const meta = {
  title: 'Components/Overlays/Popover',
  component: Popover,
  argTypes: {
    children: { table: { disable: true } },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A small panel that opens from a `Button` or `IconButton` through `render`, for something worth a click but not a dialog: a breakdown, a short explanation. Escape and a click outside close it.',
      },
    },
  },
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger render={<IconButton icon="info" label="Cost breakdown" size="s" />} />
      <Popover.Popup>
        <Popover.Close />
        <Popover.Header>
          <Popover.Title>Cost breakdown</Popover.Title>
          <Popover.Description>What run #128 spent, by step.</Popover.Description>
        </Popover.Header>
        {costBreakdown()}
      </Popover.Popup>
    </Popover>
  ),
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Cost breakdown' })

    await step('The trigger opens a dialog named by its title and described by its description', async () => {
      await userEvent.click(trigger)
      const popover = await page.findByRole('dialog', { name: 'Cost breakdown' })
      await expect(popover).toHaveAccessibleDescription('What run #128 spent, by step.')
    })

    await step('The close button closes it and gives focus back to the trigger', async () => {
      await userEvent.click(page.getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
      await expect(trigger).toHaveFocus()
    })
  },
}

/** Escape closes it, and so does a click outside: the close button is a convenience, not the only way out. */
export const Dismissing: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Cost breakdown' })

    await step('Escape closes it', async () => {
      await userEvent.click(trigger)
      await page.findByRole('dialog')
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
      await expect(trigger).toHaveFocus()
    })

    await step('A click outside closes it', async () => {
      await userEvent.click(trigger)
      await page.findByRole('dialog')
      await userEvent.click(canvasElement.ownerDocument.body)
      await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument())
    })
  },
}

/** 240, 320 and 400px: as wide as its content reads well. On a small screen it narrows to fit. */
export const Widths: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="sb-row">
      {POPOVER_WIDTHS.map((width) => (
        <Popover key={width} {...args}>
          <Popover.Trigger render={<IconButton icon="info" label={`Width ${width}`} variant="secondary" />} />
          <Popover.Popup width={width}>
            <Popover.Header>
              <Popover.Title>Width {width}</Popover.Title>
              <Popover.Description>
                Seat prices are per month, billed annually, for teams of 10 to 50.
              </Popover.Description>
            </Popover.Header>
          </Popover.Popup>
        </Popover>
      ))}
    </div>
  ),
}

/** For a short explanation, it can open on hover too, after a moment, and still on click and focus. */
export const OnHover: Story = {
  name: 'On hover',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger
        openOnHover
        delay={300}
        render={<IconButton icon="info" label="What counts as a seat" size="s" />}
      />
      <Popover.Popup width="s" align="start">
        <Popover.Header>
          <Popover.Title>What counts as a seat</Popover.Title>
          <Popover.Description>Anyone who can sign in to the workspace, agents excluded.</Popover.Description>
        </Popover.Header>
      </Popover.Popup>
    </Popover>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)
    await step('Hovering the trigger opens it', async () => {
      await userEvent.hover(canvas.getByRole('button', { name: 'What counts as a seat' }))
      await expect(await page.findByRole('dialog', { name: 'What counts as a seat' })).toBeInTheDocument()
    })
  },
}

/** Where it shows up: the cost stat of the run, with its breakdown a click away. */
export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Card variant="muted" padding="s" className="w-48">
      <Card.Header>
        <Card.Description className="text-caption">Cost</Card.Description>
        <Card.Action>
          <Popover {...args}>
            <Popover.Trigger render={<IconButton icon="info" label="Cost breakdown" size="s" className="-my-2" />} />
            <Popover.Popup align="start">
              <Popover.Header>
                <Popover.Title>Cost breakdown</Popover.Title>
                <Popover.Description>What run #128 spent, by step.</Popover.Description>
              </Popover.Header>
              {costBreakdown()}
            </Popover.Popup>
          </Popover>
        </Card.Action>
      </Card.Header>
      <Card.Body className="text-heading-s font-semibold tabular-nums">$0.84</Card.Body>
    </Card>
  ),
}
