import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Card } from '@/components/card'
import { Popover } from '@/components/popover'

import { Stat } from '.'
import { STAT_BETTER, STAT_SIZES, STAT_TRENDS, STAT_VARIANTS } from './stat.const'

/**
 * What run #128 spent, by step, for the cost stat's help: it adds up to its 38.2k tokens and $0.84. A function the
 * stories call, not a component, so the code panel shows the markup.
 */
function costBreakdown() {
  return (
    <>
      <Popover.Header>
        <Popover.Title>Cost breakdown</Popover.Title>
        <Popover.Description>What run #128 spent, by step.</Popover.Description>
      </Popover.Header>
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
    </>
  )
}

/** Run #128's four stats against run #127, the cost with its breakdown. Shared markup, so a plain function. */
function runStats() {
  return (
    <>
      <Stat label="Duration" value="4m 12s" trend="up" change="38s" better="down" comparison="vs run #127" />
      <Stat label="Tokens" value="38.2k" trend="down" change="8%" better="down" comparison="vs run #127" />
      <Stat
        label="Cost"
        value="$0.84"
        trend="down"
        change="$0.06"
        better="down"
        comparison="vs run #127"
        help={costBreakdown()}
        helpLabel="Cost breakdown"
      />
      <Stat label="Tool calls" value="23" trend="flat" comparison="vs run #127" />
    </>
  )
}

/** The color a stat's change is drawn in. */
function changeColor(canvasElement: HTMLElement, label: string) {
  const stat = [...canvasElement.querySelectorAll('dt')].find((dt) => dt.textContent === label)?.parentElement
  return getComputedStyle(stat?.querySelectorAll('dd')[1] as HTMLElement).color
}

const meta = {
  title: 'Data/Tables/Stat',
  component: Stat,
  tags: ['beta'],
  argTypes: {
    value: { control: 'text' },
    change: { control: 'text' },
    comparison: { control: 'text' },
    trend: { control: 'inline-radio', options: STAT_TRENDS },
    better: { control: 'inline-radio', options: STAT_BETTER },
    variant: { control: 'inline-radio', options: STAT_VARIANTS },
    size: { control: 'inline-radio', options: STAT_SIZES },
    help: { control: false },
    trendLabels: { control: false },
  },
  args: {
    label: 'Cost',
    value: '$0.84',
    trend: 'down',
    change: '$0.06',
    better: 'down',
    comparison: 'vs run #127',
  },
  parameters: {
    docs: {
      description: {
        component:
          'One number worth a glance, like the cost of a run, and how it moved since a run before. The change is colored by whether it is good news, which `better` decides: a cost going down is green. Several go in a `Stat.Group`, a description list laid out in a grid.',
      },
    },
  },
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { helpLabel: 'Cost breakdown' },
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  render: (args) => <Stat {...args} help={costBreakdown()} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('button', { name: 'Cost breakdown' })

    await step('A term and its definitions: the label, the value, the change in words', async () => {
      await expect(canvasElement.querySelector('dl')).not.toBeNull()
      await expect(canvas.getByRole('term')).toHaveTextContent('Cost')
      const [value, change] = canvas.getAllByRole('definition')
      await expect(value).toHaveTextContent('$0.84')
      // The arrow is hidden; "Down" says the direction to screen readers.
      await expect(change).toHaveTextContent(/^Down \$0\.06\s?vs run #127$/)
    })

    await step('On one change line, it is 68px tall: the height its loading skeleton keeps', async () => {
      await expect((canvasElement.querySelector('dl') as HTMLElement).getBoundingClientRect().height).toBe(68)
    })

    await step('The help button is 24px, in scale with the caption, and keeps the label row 16px tall', async () => {
      const { width, height } = trigger.getBoundingClientRect()
      await expect([width, height]).toEqual([24, 24])
      await expect(canvas.getByRole('term').getBoundingClientRect().height).toBe(16)
    })

    await step('The help button opens the breakdown, and Escape closes it back to the button', async () => {
      await userEvent.click(trigger)
      const popover = await page.findByRole('dialog', { name: 'Cost breakdown' })
      await expect(popover).toHaveAccessibleDescription('What run #128 spent, by step.')
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page.queryByRole('dialog')).toBeNull())
      await expect(trigger).toHaveFocus()
    })

    await step('Tab reaches the help button, and its focus ring draws', async () => {
      trigger.blur()
      await userEvent.tab()
      await expect(trigger).toHaveFocus()
      await expect(getComputedStyle(trigger).outlineStyle).toBe('solid')
      trigger.blur()
    })
  },
}

/** A run's stats together: one list, two to a row in the run's side panel. */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-box-m">
      <Stat.Group>{runStats()}</Stat.Group>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('One list for the group, with a term per stat', async () => {
      await expect(canvasElement.querySelectorAll('dl')).toHaveLength(1)
      await expect(canvas.getAllByRole('term').map((term) => term.textContent)).toEqual([
        'Duration',
        'Tokens',
        'Cost',
        'Tool calls',
      ])
    })
  },
}

/** On tiles of their own, four to a row, where the stats lead a page. */
export const Muted: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-box-l">
      <Stat.Group variant="muted" columns={4}>
        {runStats()}
      </Stat.Group>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('A change line too long for its tile puts the comparison under it, whole', async () => {
      const flat = canvas.getByText('No change')
      const comparison = canvas.getAllByText('vs run #127').at(-1) as HTMLElement
      const lineHeight = Number.parseFloat(getComputedStyle(flat).lineHeight)
      await expect(comparison.getBoundingClientRect().top).toBeGreaterThan(flat.getBoundingClientRect().top)
      await expect(comparison.getBoundingClientRect().height).toBe(lineHeight)
      await expect(flat.getBoundingClientRect().height).toBe(lineHeight)
    })
  },
}

/**
 * The arrow says which way it moved; the color says whether that's good. A longer run is bad news, fewer tokens and
 * more sources are good, and no change stays muted.
 */
export const Trends: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-box-l">
      <Stat.Group columns={4}>
        <Stat label="Duration" value="4m 12s" trend="up" change="38s" better="down" comparison="vs run #127" />
        <Stat label="Tokens" value="38.2k" trend="down" change="8%" better="down" comparison="vs run #127" />
        <Stat label="Sources" value="5" trend="up" change="1" comparison="vs run #127" />
        <Stat label="Tool calls" value="23" trend="flat" comparison="vs run #127" />
      </Stat.Group>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Bad news, good news and no change each have their own color', async () => {
      const worse = changeColor(canvasElement, 'Duration')
      const better = changeColor(canvasElement, 'Tokens')
      const flat = changeColor(canvasElement, 'Tool calls')
      await expect(changeColor(canvasElement, 'Sources')).toBe(better)
      await expect(new Set([worse, better, flat]).size).toBe(3)
    })

    await step('No change is written out, not only drawn', async () => {
      await expect(canvas.getAllByRole('definition').at(-1)).toHaveTextContent(/^No change\s?vs run #127$/)
    })
  },
}

/** `s` for panels and rows of several, `m` for a stat that leads a page. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="sb-row">
      {STAT_SIZES.map((size) => (
        <div key={size} className="sb-box-s">
          <Stat {...args} size={size} />
        </div>
      ))}
    </div>
  ),
}

/** While the run's numbers load: a skeleton for each value and change, heard once per stat. */
export const Loading: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-box-m">
      <Stat.Group>
        <Stat label="Duration" value="4m 12s" trend="up" loading />
        <Stat label="Tokens" value="38.2k" trend="down" loading />
        <Stat label="Cost" value="$0.84" trend="down" loading />
        <Stat label="Tool calls" value="23" trend="flat" loading />
      </Stat.Group>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Each stat says it is loading, and no value shows yet', async () => {
      await expect(canvas.getAllByRole('progressbar', { name: 'Loading' })).toHaveLength(4)
      await expect(canvas.queryByText('$0.84')).toBeNull()
    })

    await step('The bars sit 8px apart, and each stat keeps its loaded height, so nothing moves', async () => {
      const [value, change] = canvasElement.querySelectorAll<HTMLElement>('dd [role="progressbar"] > div')
      await expect(
        (change as HTMLElement).getBoundingClientRect().top - (value as HTMLElement).getBoundingClientRect().bottom,
      ).toBe(8)
      // The label's 16px, then 4px gaps around the value's 28px line and the change's 16px.
      for (const stat of canvasElement.querySelectorAll('dl > div')) {
        await expect(stat.getBoundingClientRect().height).toBe(68)
      }
    })
  },
}

/** Where it shows up: the run's side panel, its stats in a card under a title. */
export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-box-m">
      <Card>
        <Card.Header>
          <Card.Title>Usage</Card.Title>
          <Card.Description>What run #128 took, against run #127.</Card.Description>
        </Card.Header>
        <Card.Body>
          <Stat.Group>{runStats()}</Stat.Group>
        </Card.Body>
      </Card>
    </div>
  ),
}
