import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { Tabs } from '.'
import { TABS_SIZES, TABS_VARIANTS } from './tabs.const'

/**
 * The panels of run #128's side panel. A function the stories call, not a component, so the code panel shows the
 * markup.
 */
function runPanels() {
  return (
    <>
      <Tabs.Panel value="results">Seat prices for Fieldnote, Brightloop, Tandem, Orbit and Kitewise.</Tabs.Panel>
      <Tabs.Panel value="details">4m 12s, 38.2k tokens, $0.84 and 23 tool calls.</Tabs.Panel>
      <Tabs.Panel value="logs">No logs yet.</Tabs.Panel>
    </>
  )
}

/** Where the indicator is drawn, measured: it has no role of its own to find it by. */
function getIndicator(canvasElement: HTMLElement) {
  const indicator = canvasElement.querySelector<HTMLElement>('[role="tablist"] > [role="presentation"]')
  if (!indicator) throw new Error('No indicator in the tab list')
  return indicator
}

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  tags: ['beta'],
  argTypes: {
    variant: { control: 'inline-radio', options: TABS_VARIANTS },
    size: { control: 'inline-radio', options: TABS_SIZES },
    children: { table: { disable: true } },
    value: { table: { disable: true } },
    render: { table: { disable: true } },
    style: { table: { disable: true } },
    defaultValue: { control: 'select', options: ['results', 'details', 'logs'] },
  },
  args: { defaultValue: 'results', onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Sections of one view, one shown at a time: a row of tabs and the panel of the active one. Tabs take an icon and a count. `line` draws a bar under the active tab, for a panel's sections; `segmented` raises a tile on a track, for a small switch. Either way one indicator glides from tab to tab, and the new panel fades in. When the tabs don't fit, the row scrolls sideways; `fill` stretches them across a narrow panel. Built on Base UI's Tabs: arrow keys, Home and End move between tabs, Enter or Space picks one, and each panel is named by its tab. Give the list an `aria-label` when nothing on screen names it.",
      },
    },
  },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Run #128">
        <Tabs.Tab value="results" count={5}>
          Results
        </Tabs.Tab>
        <Tabs.Tab value="details">Details</Tabs.Tab>
        <Tabs.Tab value="logs">Logs</Tabs.Tab>
      </Tabs.List>
      {runPanels()}
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ args, canvas, canvasElement, step }) => {
    const results = canvas.getByRole('tab', { name: 'Results 5' })
    const details = canvas.getByRole('tab', { name: 'Details' })

    await step('A tab list names its tabs, and the active one shows its panel, named by it', async () => {
      await expect(canvas.getByRole('tablist', { name: 'Run #128' })).toBeInTheDocument()
      await expect(canvas.getAllByRole('tab')).toHaveLength(3)
      await expect(results).toHaveAttribute('aria-selected', 'true')
      await expect(canvas.getByRole('tabpanel', { name: 'Results 5' })).toHaveTextContent('Seat prices')
    })

    await step('A click picks a tab: its panel replaces the other', async () => {
      await userEvent.click(details)
      await expect(details).toHaveAttribute('aria-selected', 'true')
      await expect(args.onValueChange).toHaveBeenLastCalledWith('details', expect.anything())
      await expect(canvas.getByRole('tabpanel', { name: 'Details' })).toHaveTextContent('38.2k tokens')
      // At once, not after a frame: the two panels never stack.
      await expect(canvas.queryByRole('tabpanel', { name: 'Results 5' })).not.toBeInTheDocument()
    })

    await step('The indicator glides to the tab and takes its width', async () => {
      const indicator = getIndicator(canvasElement)
      // Under the tabs by markup order, not a negative z-index, so contrast checkers can tell what the tabs sit on.
      await expect(indicator.parentElement?.firstElementChild).toBe(indicator)
      await expect(getComputedStyle(indicator).zIndex).toBe('auto')
      await waitFor(() => {
        const from = details.getBoundingClientRect()
        const to = indicator.getBoundingClientRect()
        expect(Math.abs(to.left - from.left)).toBeLessThan(1)
        expect(Math.abs(to.width - from.width)).toBeLessThan(1)
      })
    })

    await step('Tab moves from the tab into its panel', async () => {
      await userEvent.tab()
      await expect(canvas.getByRole('tabpanel', { name: 'Details' })).toHaveFocus()
    })
  },
}

/** The keyboard: arrows move between tabs and wrap at the ends, Home and End jump, Enter or Space picks. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    const results = canvas.getByRole('tab', { name: 'Results 5' })
    const details = canvas.getByRole('tab', { name: 'Details' })
    const logs = canvas.getByRole('tab', { name: 'Logs' })

    await step('The arrows move focus without picking', async () => {
      results.focus()
      await userEvent.keyboard('{ArrowRight}')
      await expect(details).toHaveFocus()
      await expect(results).toHaveAttribute('aria-selected', 'true')
    })

    await step('Enter picks the focused tab', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(details).toHaveAttribute('aria-selected', 'true')
    })

    await step('End and Home jump to the ends, and the arrows wrap around', async () => {
      await userEvent.keyboard('{End}')
      await expect(logs).toHaveFocus()
      await userEvent.keyboard('{ArrowRight}')
      await expect(results).toHaveFocus()
      await userEvent.keyboard('{Home}{ArrowLeft}')
      await expect(logs).toHaveFocus()
    })

    await step('Space picks too', async () => {
      await userEvent.keyboard(' ')
      await expect(logs).toHaveAttribute('aria-selected', 'true')
    })
  },
}

/** With `activateOnFocus`, a tab is picked as the arrows reach it: for panels that are quick to show. */
export const ActivateOnFocus: Story = {
  name: 'Activate on focus',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Run #128" activateOnFocus>
        <Tabs.Tab value="results" count={5}>
          Results
        </Tabs.Tab>
        <Tabs.Tab value="details">Details</Tabs.Tab>
        <Tabs.Tab value="logs">Logs</Tabs.Tab>
      </Tabs.List>
      {runPanels()}
    </Tabs>
  ),
  play: async ({ canvas, step }) => {
    await step('An arrow picks the tab it reaches', async () => {
      canvas.getByRole('tab', { name: 'Results 5' }).focus()
      await userEvent.keyboard('{ArrowRight}')
      await expect(canvas.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true')
      await expect(canvas.getByRole('tabpanel', { name: 'Details' })).toBeInTheDocument()
    })
  },
}

/** A raised tile on a track, for a small switch between views of the same thing, like what a chart plots. */
export const Segmented: Story = {
  args: { variant: 'segmented', size: 's', defaultValue: 'tokens' },
  argTypes: { defaultValue: { control: 'select', options: ['tokens', 'cost', 'calls'] } },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Chart">
        <Tabs.Tab value="tokens">Tokens</Tabs.Tab>
        <Tabs.Tab value="cost">Cost</Tabs.Tab>
        <Tabs.Tab value="calls">Tool calls</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tokens">38.2k tokens over 4m 12s.</Tabs.Panel>
      <Tabs.Panel value="cost">$0.84 in all.</Tabs.Panel>
      <Tabs.Panel value="calls">23 tool calls, 1 failed.</Tabs.Panel>
    </Tabs>
  ),
}

/** `s` (32px) and `m` (40px), in both looks. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['variant', 'size'] } },
  render: (args) => (
    <div className="sb-stack">
      {TABS_VARIANTS.flatMap((variant) =>
        TABS_SIZES.map((size) => (
          <Tabs key={`${variant}-${size}`} {...args} variant={variant} size={size}>
            <Tabs.List aria-label={`Run #128, ${variant} ${size}`}>
              <Tabs.Tab value="results" count={5}>
                Results
              </Tabs.Tab>
              <Tabs.Tab value="details">Details</Tabs.Tab>
              <Tabs.Tab value="logs">Logs</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        )),
      )}
    </div>
  ),
}

/** An icon before each label, from Norte's set. */
export const WithIcons: Story = {
  name: 'With icons',
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Run #128">
        <Tabs.Tab value="results" icon="file" count={5}>
          Results
        </Tabs.Tab>
        <Tabs.Tab value="details" icon="info">
          Details
        </Tabs.Tab>
        <Tabs.Tab value="logs" icon="terminal">
          Logs
        </Tabs.Tab>
      </Tabs.List>
      {runPanels()}
    </Tabs>
  ),
}

/** A tab that can't be opened right now stays in the row, dimmed, and a click doesn't pick it. */
export const DisabledTab: Story = {
  name: 'Disabled tab',
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Run #128">
        <Tabs.Tab value="results" count={5}>
          Results
        </Tabs.Tab>
        <Tabs.Tab value="details">Details</Tabs.Tab>
        <Tabs.Tab value="logs" disabled>
          Logs
        </Tabs.Tab>
      </Tabs.List>
      {runPanels()}
    </Tabs>
  ),
  play: async ({ canvas, step }) => {
    await step('A click on the disabled tab leaves the active one', async () => {
      const logs = canvas.getByRole('tab', { name: 'Logs' })
      await expect(logs).toHaveAttribute('aria-disabled', 'true')
      await userEvent.click(logs, { pointerEventsCheck: 0 })
      await expect(logs).toHaveAttribute('aria-selected', 'false')
      await expect(canvas.getByRole('tab', { name: 'Results 5' })).toHaveAttribute('aria-selected', 'true')
    })
  },
}

/** With `fill`, the tabs share the whole width: in a narrow panel, like the run's side panel. */
export const Fill: Story = {
  render: (args) => (
    <div className="sb-box-m">
      <Tabs {...args}>
        <Tabs.List aria-label="Run #128" fill>
          <Tabs.Tab value="results" count={5}>
            Results
          </Tabs.Tab>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="logs">Logs</Tabs.Tab>
        </Tabs.List>
        {runPanels()}
      </Tabs>
    </div>
  ),
}

/**
 * When the tabs don't fit, the row scrolls sideways. Each side that hides tabs fades them out, with a chevron that
 * scrolls a page: wheel, trackpad, touch and the arrow keys scroll too, and the indicator scrolls with the row.
 */
export const Overflow: Story = {
  argTypes: { defaultValue: { control: false } },
  render: (args) => (
    <div className="sb-box-m">
      <Tabs {...args}>
        <Tabs.List aria-label="Run #128">
          <Tabs.Tab value="results" count={5}>
            Results
          </Tabs.Tab>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="sources" count={5}>
            Sources
          </Tabs.Tab>
          <Tabs.Tab value="tools" count={23}>
            Tool calls
          </Tabs.Tab>
          <Tabs.Tab value="logs">Logs</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="results">Seat prices for Fieldnote, Brightloop, Tandem, Orbit and Kitewise.</Tabs.Panel>
        <Tabs.Panel value="details">4m 12s, 38.2k tokens, $0.84 and 23 tool calls.</Tabs.Panel>
        <Tabs.Panel value="sources">5 sources, 1 failed: Orbit&apos;s pricing page timed out.</Tabs.Panel>
        <Tabs.Panel value="tools">web_search, read_file, fetch_url, write_summary and send_email.</Tabs.Panel>
        <Tabs.Panel value="logs">No logs yet.</Tabs.Panel>
        <Tabs.Panel value="settings">Research agent, on the Balanced model.</Tabs.Panel>
      </Tabs>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const scroller = canvas.getByRole('tablist').parentElement as HTMLElement
    const bar = scroller.parentElement as HTMLElement
    // Hidden from screen readers and out of the tab order: the arrow keys already move along the row.
    // By label: a chevron while invisible has no accessible name to find it by role.
    const back = canvas.getByLabelText('Scroll tabs back')
    const forward = canvas.getByLabelText('Scroll tabs forward')

    await step('At the start, only the end fades, with its chevron', async () => {
      await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth)
      await waitFor(() => expect(bar).toHaveAttribute('data-overflow-end'))
      await expect(bar).not.toHaveAttribute('data-overflow-start')
      await expect(forward).toHaveAttribute('tabindex', '-1')
      // Invisible, not only transparent: a hidden chevron covers no tab, so contrast checkers can read the first one.
      await expect(getComputedStyle(back.parentElement as HTMLElement).visibility).toBe('hidden')
    })

    await step('The keyboard reaches the last tab: the end stops fading and the start fades', async () => {
      canvas.getByRole('tab', { name: 'Results 5' }).focus()
      await userEvent.keyboard('{End}{Enter}')
      const settings = canvas.getByRole('tab', { name: 'Settings' })
      await expect(settings).toHaveAttribute('aria-selected', 'true')
      await waitFor(() => expect(bar).not.toHaveAttribute('data-overflow-end'))
      await expect(bar).toHaveAttribute('data-overflow-start')
      await expect(settings.getBoundingClientRect().right).toBeLessThanOrEqual(
        scroller.getBoundingClientRect().right + 1,
      )
    })

    // Each chevron scrolls from wherever the row is, even mid-scroll: a page back hides the end again, a page forward
    // reaches it.
    await step('The start chevron scrolls a page back', async () => {
      await userEvent.click(back)
      await waitFor(() => expect(bar).toHaveAttribute('data-overflow-end'))
    })

    await step('The end chevron scrolls a page forward', async () => {
      await userEvent.click(forward)
      await waitFor(() => expect(bar).not.toHaveAttribute('data-overflow-end'))
    })
  },
}
