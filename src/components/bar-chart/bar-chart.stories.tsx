import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'

import { BarChart, type BarChartItem } from '.'

/** Run #128's 23 tool calls, by tool. `send_email` waits on the approval, so it hasn't run yet. */
const TOOL_CALLS: BarChartItem[] = [
  { label: 'fetch_url', value: 10 },
  { label: 'web_search', value: 8 },
  { label: 'write_summary', value: 3 },
  { label: 'read_file', value: 2 },
  { label: 'send_email', value: 0 },
]

const SUMMARY =
  '23 tool calls, most of them fetch_url (10), reading the five pricing pages and their archived versions. send_email waits on the approval.'

/** The tokens each step of run #128's plan spent: they add up to its 38.2k. */
const TOKENS_BY_STEP: BarChartItem[] = [
  { label: 'Visit each pricing page and its archived version', value: 21_400 },
  { label: 'Compare seat prices and annual discounts', value: 9300 },
  { label: 'Draft the summary', value: 5400 },
  { label: "Read the brief and last quarter's report", value: 2100 },
]

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/** Tokens the way the run's stats say them: "38.2k". */
function tokens(value: number) {
  return compact.format(value).toLowerCase()
}

const meta = {
  title: 'Data/Charts/Bar chart',
  component: BarChart,
  tags: ['beta'],
  argTypes: {
    data: { control: 'object' },
    labelFont: { control: 'inline-radio', options: ['sans', 'mono'] },
    formatValue: { control: false },
  },
  args: {
    label: 'Tool calls',
    categoryLabel: 'Tool',
    summary: SUMMARY,
    data: TOOL_CALLS,
    labelFont: 'mono',
  },
  parameters: {
    docs: {
      description: {
        component:
          "How several things compare, one bar each, like a run's tool calls by tool. Pointing at a row or walking the rows with the arrow keys reads its bar, and screen readers get a summary and the data as a table. It fills its box's width and grows a row per bar, so its width is a class. When the data changes, the bars glide to their new lengths and places. Built on visx; idea from Tremor's bar chart.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-m">
      <BarChart {...args} />
    </div>
  ),
} satisfies Meta<typeof BarChart>

export default meta
type Story = StoryObj<typeof meta>

/** The readout beside a bar, or nothing while it's hidden. */
function readout(canvasElement: HTMLElement) {
  const tooltip = canvasElement.querySelector('[data-side]')
  const layer = tooltip?.parentElement?.parentElement
  return layer && !layer.hasAttribute('data-hidden') ? tooltip?.textContent : null
}

/** The value axis's labels, as drawn. */
function tickLabels(canvasElement: HTMLElement) {
  return [...canvasElement.querySelectorAll<SVGTextElement>('svg text')]
}

/** Whether any two of the value axis's labels touch. */
function labelsOverlap(canvasElement: HTMLElement) {
  const boxes = tickLabels(canvasElement)
    .map((label) => label.getBoundingClientRect())
    .sort((a, b) => a.left - b.left)
  return boxes.some((box, index) => index > 0 && box.left < (boxes[index - 1] as DOMRect).right)
}

/** The figure's height in px: 32px a row, 8px above them and 24px under them for the axis. */
function figureHeight(canvasElement: HTMLElement) {
  return within(canvasElement).getByRole('figure').getBoundingClientRect().height
}

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const rows = canvas.getByRole('slider', { name: 'Tool calls' })

    await step('A figure named by its label, described by its summary, with its data as a table', async () => {
      const figure = canvas.getByRole('figure', { name: 'Tool calls' })
      await expect(figure).toHaveAccessibleDescription(SUMMARY)
      const table = canvas.getByRole('table', { name: 'Tool calls' })
      const tableRows = within(table).getAllByRole('row')
      await expect(tableRows).toHaveLength(TOOL_CALLS.length + 1)
      await expect(within(tableRows[1] as HTMLElement).getByRole('rowheader')).toHaveTextContent('fetch_url')
      await expect(within(tableRows[1] as HTMLElement).getByRole('cell')).toHaveTextContent('10')
      await expect(canvasElement.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull()
    })

    await step('A row of 32px per bar, and whole numbers along the axis', async () => {
      await expect(figureHeight(canvasElement)).toBe(5 * 32 + 8 + 24)
      await waitFor(() => expect(tickLabels(canvasElement).length).toBeGreaterThan(1))
      for (const label of tickLabels(canvasElement)) await expect(label.textContent).toMatch(/^\d+$/)
      await expect(labelsOverlap(canvasElement)).toBe(false)
    })

    await step('Tab reaches the rows, draws their ring and reads the first bar', async () => {
      await userEvent.tab()
      await expect(rows).toHaveFocus()
      await expect(getComputedStyle(rows).outlineStyle).toBe('solid')
      await expect(rows).toHaveAttribute('aria-valuetext', 'fetch_url: 10')
      await expect(readout(canvasElement)).toBe('fetch_url10')
    })

    await step('The other bars dim and the row’s label turns ink', async () => {
      await expect(canvasElement.querySelectorAll('[data-dimmed]')).toHaveLength(TOOL_CALLS.length - 1)
      await expect(canvas.getByText('fetch_url', { selector: '[data-active]' })).toBeInTheDocument()
    })

    await step('The arrows walk the bars, Home and End jump to the ends', async () => {
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      await expect(rows).toHaveAttribute('aria-valuetext', 'write_summary: 3')
      await expect(rows).toHaveAttribute('aria-valuenow', '2')
      await userEvent.keyboard('{ArrowUp}')
      await expect(rows).toHaveAttribute('aria-valuetext', 'web_search: 8')
      await userEvent.keyboard('{End}')
      await expect(rows).toHaveAttribute('aria-valuetext', 'send_email: 0')
      await userEvent.keyboard('{ArrowRight}')
      await expect(rows).toHaveAttribute('aria-valuenow', '4')
      await userEvent.keyboard('{Home}')
      await expect(rows).toHaveAttribute('aria-valuetext', 'fetch_url: 10')
    })

    await step('Escape hides the readout and keeps focus; an arrow shows it again', async () => {
      await userEvent.keyboard('{Escape}')
      await expect(readout(canvasElement)).toBeNull()
      await expect(canvasElement.querySelectorAll('[data-dimmed]')).toHaveLength(0)
      await expect(rows).toHaveFocus()
      await userEvent.keyboard('{ArrowDown}')
      await expect(readout(canvasElement)).toBe('web_search8')
      rows.blur()
      await waitFor(() => expect(readout(canvasElement)).toBeNull())
    })

    await step('The pointer reads the row it’s on, label included, and leaving hides it', async () => {
      const box = rows.getBoundingClientRect()
      // Over the label of the third row, not its bar.
      fireEvent.pointerMove(rows, { clientX: box.left + 8, clientY: box.top + 2 * 32 + 16 })
      await waitFor(() => expect(readout(canvasElement)).toBe('write_summary3'))
      await expect(rows).toHaveAttribute('aria-valuetext', 'write_summary: 3')
      fireEvent.pointerMove(rows, { clientX: box.right - 8, clientY: box.top + 4 * 32 + 8 })
      await waitFor(() => expect(readout(canvasElement)).toBe('send_email0'))
      // React reads a leave from `pointerout` to an element outside.
      fireEvent.pointerOut(rows, { relatedTarget: canvasElement.ownerDocument.body })
      await waitFor(() => expect(readout(canvasElement)).toBeNull())
    })
  },
}

/**
 * Steps of the plan, in the sans font: a label past 40% of the width truncates, and the readout says it whole, wrapping
 * to fit beside the bar.
 */
export const LongLabels: Story = {
  args: {
    label: 'Tokens',
    categoryLabel: 'Step',
    summary: undefined,
    data: TOKENS_BY_STEP,
    labelFont: 'sans',
    formatValue: tokens,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const rows = canvas.getByRole('slider', { name: 'Tokens' })

    await step('The labels take 40% of the width at most, the longest cut short', async () => {
      const label = canvas.getByText(TOKENS_BY_STEP[0]?.label as string, { selector: 'span' })
      await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
      const column = label.parentElement?.parentElement as HTMLElement
      await expect(column.getBoundingClientRect().width).toBeLessThanOrEqual(
        rows.getBoundingClientRect().width * 0.4 + 0.5,
      )
      const short = canvas.getByText('Draft the summary', { selector: 'span' })
      await expect(short.scrollWidth).toBe(short.clientWidth)
    })

    await step('The readout and the table say it whole, the readout wrapping to stay inside the chart', async () => {
      rows.focus()
      await userEvent.keyboard('{Home}')
      await expect(readout(canvasElement)).toBe('Visit each pricing page and its archived version21.4k')
      const tooltip = (canvasElement.querySelector('[data-side]') as HTMLElement).getBoundingClientRect()
      const figure = canvas.getByRole('figure').getBoundingClientRect()
      await expect(tooltip.left).toBeGreaterThanOrEqual(figure.left)
      await expect(tooltip.right).toBeLessThanOrEqual(figure.right)
      await expect(canvas.getByRole('rowheader', { name: TOKENS_BY_STEP[0]?.label })).toBeInTheDocument()
      rows.blur()
    })
  },
}

/** While the data loads, rows of placeholders hold the chart's height, so nothing moves when it arrives. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('progressbar', { name: 'Loading chart' })).toBeInTheDocument()
    await expect(canvas.queryByRole('slider')).toBeNull()
    await expect(canvas.queryByRole('table')).toBeNull()
    await expect(figureHeight(canvasElement)).toBe(5 * 32 + 8 + 24)
  },
}

/** At 280px, the narrowest panel it lives in: fewer labels along the axis, and the readout flips to stay inside. */
export const Narrow: Story = {
  args: { className: 'w-70' },
  render: (args) => <BarChart {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const rows = canvas.getByRole('slider')

    await step("Every tool's name fits, and the axis's labels don't touch", async () => {
      for (const { label } of TOOL_CALLS) {
        const text = canvas.getByText(label, { selector: 'span' })
        await expect(text.scrollWidth).toBe(text.clientWidth)
      }
      await waitFor(() => expect(tickLabels(canvasElement).length).toBeGreaterThan(1))
      await expect(labelsOverlap(canvasElement)).toBe(false)
    })

    await step('The readout opens to the left past the middle, inside the chart', async () => {
      rows.focus()
      await userEvent.keyboard('{Home}')
      const tooltip = canvasElement.querySelector('[data-side]') as HTMLElement
      await expect(tooltip).toHaveAttribute('data-side', 'left')
      const figure = canvas.getByRole('figure').getBoundingClientRect()
      await expect(tooltip.getBoundingClientRect().left).toBeGreaterThanOrEqual(figure.left)
      await userEvent.keyboard('{End}')
      await expect(tooltip).toHaveAttribute('data-side', 'right')
      rows.blur()
    })
  },
}

/** Run #128's tool calls in the order it made them. */
const CALL_ORDER = [
  'read_file',
  'read_file',
  'web_search',
  'web_search',
  'fetch_url',
  'fetch_url',
  'web_search',
  'fetch_url',
  'fetch_url',
  'web_search',
  'fetch_url',
  'fetch_url',
  'web_search',
  'fetch_url',
  'fetch_url',
  'web_search',
  'fetch_url',
  'web_search',
  'fetch_url',
  'web_search',
  'write_summary',
  'write_summary',
  'write_summary',
] as const

/** The tool calls after the first `made`, most first, in the order the tools were first used on a tie. */
function callsAfter(made: number): BarChartItem[] {
  const counts = new Map(TOOL_CALLS.map(({ label }) => [label, 0]))
  for (const tool of CALL_ORDER.slice(0, made)) counts.set(tool, (counts.get(tool) ?? 0) + 1)
  return [...counts]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || CALL_ORDER.indexOf(a.label as never) - CALL_ORDER.indexOf(b.label as never))
}

/**
 * A run still going: a call arrives every second, its bar glides longer, and the rows glide to their new places as
 * one tool overtakes another. After the 23rd call it starts over.
 */
export const Live: Story = {
  args: { summary: undefined },
  render: function LiveRender(args) {
    const [made, setMade] = useState(4)
    useEffect(() => {
      const timer = setInterval(() => setMade((count) => (count >= CALL_ORDER.length ? 1 : count + 1)), 1000)
      return () => clearInterval(timer)
    }, [])
    return (
      <div className="sb-box-m">
        <BarChart {...args} data={callsAfter(made)} />
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    function firstTool() {
      return within(canvas.getByRole('table')).getAllByRole('rowheader')[0]?.textContent
    }

    await step('Four calls in: read_file and web_search tie, read_file first', async () => {
      await expect(firstTool()).toBe('read_file')
    })

    await step('A new call glides its bar longer', async () => {
      const bars = [...canvasElement.querySelectorAll('svg rect:not(clipPath rect)')]
      await waitFor(() => expect(bars.some((bar) => bar.getAnimations().length > 0)).toBe(true), { timeout: 2000 })
    })

    await step('As web_search overtakes read_file, the rows glide to their new places', async () => {
      await waitFor(() => expect(firstTool()).not.toBe('read_file'), { timeout: 3000 })
      const rows = [...canvasElement.querySelectorAll('svg g[clip-path] > g')]
      await expect(rows.some((row) => row.getAnimations().length > 0)).toBe(true)
    })
  },
}
