import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { ICON_NAMES } from '@/components/icon/icon.const'
import { ToolCall } from '@/components/tool-call'

import { Alert } from '.'
import { ALERT_TONES } from './alert.const'

const ORBIT_TITLE = "Orbit's pricing page timed out"
const ORBIT_DESCRIPTION = "The run went on with 4 of 5 competitors. Orbit's prices come from last quarter's report."

/** Each tone's example: what the Research agent might say about run #128. */
const TONE_EXAMPLES = {
  info: {
    title: 'Archived pages are from June 30',
    description: 'Prices are compared against the last snapshot before the quarter ended.',
  },
  success: { title: 'Summary saved', description: "reports/pricing-q3.md is ready to review before it's sent." },
  warning: { title: ORBIT_TITLE, description: ORBIT_DESCRIPTION },
  danger: {
    title: "The email couldn't be sent",
    description: 'The mail server refused the connection. Nothing was sent.',
  },
} as const

/** Where an element sits in the viewport; throws if it's missing, so a test fails on it instead of on `undefined`. */
function boxOf(element: Element | undefined) {
  if (!element) throw new Error('Expected an element')
  return element.getBoundingClientRect()
}

/** The vertical middle of an element, in the viewport. */
function middleOf(element: Element | undefined) {
  const box = boxOf(element)
  return box.top + box.height / 2
}

const meta = {
  title: 'Components/Feedback/Alert',
  component: Alert,
  tags: ['beta'],
  argTypes: {
    tone: { control: 'inline-radio', options: ALERT_TONES },
    icon: { control: 'select', options: [false, ...ICON_NAMES] },
    role: { control: 'inline-radio', options: ['alert', 'status'] },
    title: { control: 'text' },
    children: { control: 'text' },
  },
  args: { title: ORBIT_TITLE, children: ORBIT_DESCRIPTION, onAction: fn(), onDismiss: fn() },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "An inline message in a tone, with an action and an optional dismiss. Not a toast: it stays where the problem is until it's dealt with. Screen readers announce it as it appears.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-l">
      <Alert {...args} />
    </div>
  ),
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    tone: 'warning',
    dismissible: true,
    actionLabel: 'Retry Orbit',
  },
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, args, step }) => {
    const alert = canvas.getByRole('alert')

    await step('A warning is an alert, with its title, description and action', async () => {
      await expect(alert).toHaveTextContent(ORBIT_TITLE)
      await expect(alert).toHaveTextContent(ORBIT_DESCRIPTION)
      await expect(canvas.getByRole('button', { name: 'Retry Orbit' })).toBeInTheDocument()
    })

    await step('Its icon says nothing to a screen reader', async () => {
      await expect(alert.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull()
    })

    await step('The icon, title and close button center on the first line', async () => {
      const line = middleOf(canvas.getByText(ORBIT_TITLE))
      for (const element of [
        alert.querySelector('svg') ?? undefined,
        canvas.getByRole('button', { name: 'Dismiss' }),
      ]) {
        await expect(Math.abs(middleOf(element) - line)).toBeLessThanOrEqual(1)
      }
    })

    await step('The action sits in the bottom-right corner, on the last line of the description', async () => {
      await document.fonts.ready
      const action = boxOf(canvas.getByRole('button', { name: 'Retry Orbit' }))
      const description = boxOf(canvas.getByText(ORBIT_DESCRIPTION))
      // Its label on the description's last 20px line, its box 12px from the bottom, its edge under the close button's.
      await expect(Math.abs(action.top + action.height / 2 - (description.bottom - 10))).toBeLessThanOrEqual(1)
      await expect(Math.abs(boxOf(alert).bottom - 12 - action.bottom)).toBeLessThanOrEqual(1)
      await expect(
        Math.abs(action.right - boxOf(canvas.getByRole('button', { name: 'Dismiss' })).right),
      ).toBeLessThanOrEqual(1)
    })

    await step('Tab reaches the close button first, and its ring draws', async () => {
      ;(document.activeElement as HTMLElement | null)?.blur()
      await userEvent.tab()
      const close = canvas.getByRole('button', { name: 'Dismiss' })
      await expect(close).toHaveFocus()
      await expect(getComputedStyle(close).outlineStyle).toBe('solid')
    })

    await step('A click dismisses it, and onDismiss runs once it has left', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }))
      await waitFor(() => expect(canvas.queryByRole('alert')).not.toBeInTheDocument())
      await waitFor(() => expect(args.onDismiss).toHaveBeenCalledTimes(1))
    })
  },
}

/** `warning` and `danger` interrupt a screen reader; `info` and `success` wait. */
export const Tones: Story = {
  parameters: { controls: { exclude: ['tone', 'title', 'children'] } },
  render: (args) => (
    <div className="sb-stack sb-stack--stretch sb-box-l">
      {ALERT_TONES.map((tone) => (
        <Alert key={tone} {...args} tone={tone} title={TONE_EXAMPLES[tone].title}>
          {TONE_EXAMPLES[tone].description}
        </Alert>
      ))}
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('Warning and danger interrupt; info and success wait', async () => {
      await expect(canvas.getAllByRole('alert')).toHaveLength(2)
      await expect(canvas.getAllByRole('status')).toHaveLength(2)
    })

    await step('Each tone has its own tint', async () => {
      const tints = [...canvas.getAllByRole('alert'), ...canvas.getAllByRole('status')].map(
        (alert) => getComputedStyle(alert).backgroundColor,
      )
      await expect(new Set(tints).size).toBe(4)
    })
  },
}

/** One action, in the bottom-right corner, wrapping under the description when it runs out of room. */
export const WithAction: Story = {
  name: 'With action',
  args: { tone: 'warning', actionLabel: 'Retry Orbit' },
  render: (args) => (
    <div className="sb-stack">
      <div className="sb-box-m">
        <Alert {...args} />
      </div>
      <div className="sb-box-l">
        <Alert {...args} />
      </div>
    </div>
  ),
  play: async ({ canvas, args, step }) => {
    // Where the text wraps depends on Inter's widths: measure once it has loaded.
    await document.fonts.ready
    const alerts = canvas.getAllByRole('alert')
    const retries = canvas.getAllByRole('button', { name: 'Retry Orbit' })
    const descriptions = canvas.getAllByText(ORBIT_DESCRIPTION)

    await step('At every width, it ends at the right edge', async () => {
      for (const [index, alert] of alerts.entries()) {
        // 16px of padding, the ghost button's box flush with it.
        await expect(Math.abs(boxOf(alert).right - 16 - boxOf(retries[index]).right)).toBeLessThanOrEqual(1)
      }
    })

    await step('Narrow: it wraps under the description', async () => {
      await expect(boxOf(retries[0]).top).toBeGreaterThan(boxOf(descriptions[0]).bottom)
    })

    await step("Wide: it shares the description's last line", async () => {
      const retry = boxOf(retries[1])
      await expect(Math.abs(retry.top + retry.height / 2 - (boxOf(descriptions[1]).bottom - 10))).toBeLessThanOrEqual(1)
    })

    await step('A click calls onAction', async () => {
      await userEvent.click(retries[1] as HTMLElement)
      await expect(args.onAction).toHaveBeenCalledTimes(1)
    })
  },
}

/** A close button: the alert fades, then closes its height. */
export const Dismissible: Story = {
  args: {
    tone: 'success',
    dismissible: true,
    title: TONE_EXAMPLES.success.title,
    children: TONE_EXAMPLES.success.description,
  },
  play: async ({ canvas, args, step }) => {
    // Right as it renders, before Motion has loaded: it must leave even without its exit animation.
    await step('Enter on the close button dismisses it, even right away', async () => {
      ;(document.activeElement as HTMLElement | null)?.blur()
      await userEvent.tab()
      await userEvent.keyboard('{Enter}')
      await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
      await waitFor(() => expect(args.onDismiss).toHaveBeenCalledTimes(1))
    })
  },
}

/** Just a title. */
export const TitleOnly: Story = {
  name: 'Title only',
  args: { tone: 'success', title: 'Summary sent to the leadership team', children: undefined },
}

/** Another icon in place of the tone's, or none. */
export const Icons: Story = {
  parameters: { controls: { exclude: ['icon'] } },
  render: (args) => (
    <div className="sb-stack sb-stack--stretch sb-box-l">
      <Alert {...args} icon="tool" />
      <Alert {...args} icon={false} />
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('The second one has no icon', async () => {
      const withIcon = canvas.getAllByRole('status').filter((alert) => alert.querySelector('svg'))
      await expect(withIcon).toHaveLength(1)
    })
  },
}

/** In a run, right under the tool call that failed. */
export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-panel sb-stack sb-stack--stretch">
      <div className="sb-row">
        <ToolCall name="fetch_url" detail="fieldnote.com/pricing" status="success" startedAt={0} endedAt={1_420} />
        <ToolCall name="fetch_url" detail="orbit.so/pricing" status="error" startedAt={0} endedAt={30_000} />
      </div>
      <Alert tone="warning" title={ORBIT_TITLE} actionLabel="Retry Orbit">
        {ORBIT_DESCRIPTION}
      </Alert>
    </div>
  ),
}
