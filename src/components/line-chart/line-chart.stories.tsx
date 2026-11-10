import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'

import { LineChart, type LineChartPoint } from '.'

/**
 * The tokens run #128 spent each minute, read every 30 seconds over its 4m 12s: slow while it read the brief, fast
 * through the pricing pages, a dip while Orbit's page timed out, then the summary. They add up to its 38.2k tokens.
 */
const TOKENS_PER_MINUTE: LineChartPoint[] = [
  { x: 0, y: 0 },
  { x: 0.5, y: 4200 },
  { x: 1, y: 7800 },
  { x: 1.5, y: 11_600 },
  { x: 2, y: 13_400 },
  { x: 2.5, y: 6100 },
  { x: 3, y: 12_200 },
  { x: 3.5, y: 10_400 },
  { x: 4, y: 7900 },
  { x: 4.2, y: 7000 },
]

const SUMMARY =
  "Peaked at 13.4k tokens a minute at 2m, while reading the pricing pages, and dipped to 6.1k at 2m 30s as Orbit's page timed out."

/** Minutes into the run, the way its timer says them: "0m", "30s", "2m 30s", "4m 12s". */
function elapsed(minutes: number) {
  const seconds = Math.round(minutes * 60)
  const whole = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (!rest) return `${whole}m`
  return whole ? `${whole}m ${rest}s` : `${rest}s`
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/** Tokens the way the run's stats say them: "38.2k". */
function tokens(value: number) {
  return compact.format(value).toLowerCase()
}

const meta = {
  title: 'Data/Charts/Line chart',
  component: LineChart,
  tags: ['beta'],
  argTypes: {
    data: { control: 'object' },
    formatX: { control: false },
    formatY: { control: false },
  },
  args: {
    label: 'Tokens per minute',
    xLabel: 'Elapsed',
    summary: SUMMARY,
    data: TOKENS_PER_MINUTE,
    formatX: elapsed,
    formatY: tokens,
  },
  parameters: {
    docs: {
      description: {
        component:
          "How one number moved over time, like the tokens a run spent each minute. Pointing at it or walking it with the arrow keys reads the nearest point, and screen readers get a summary and the data as a table. It fills its box, so its size is a class. New data glides in, and with `maxPoints` a live chart scrolls instead of crowding. Built on visx; idea from Tremor's area chart.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-l">
      <LineChart {...args} />
    </div>
  ),
} satisfies Meta<typeof LineChart>

export default meta
type Story = StoryObj<typeof meta>

/** The readout over the plot, or nothing while it's hidden. */
function readout(canvasElement: HTMLElement) {
  const layer = canvasElement.querySelector('[role="slider"] > [aria-hidden="true"]')
  return layer && !layer.hasAttribute('data-hidden') ? layer.textContent : null
}

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const plot = canvas.getByRole('slider', { name: 'Tokens per minute' })

    await step('A figure named by its label, described by its summary, with its data as a table', async () => {
      const figure = canvas.getByRole('figure', { name: 'Tokens per minute' })
      await expect(figure).toHaveAccessibleDescription(SUMMARY)
      const table = canvas.getByRole('table', { name: 'Tokens per minute' })
      const rows = within(table).getAllByRole('row')
      await expect(rows).toHaveLength(TOKENS_PER_MINUTE.length + 1)
      await expect(within(rows[5] as HTMLElement).getByRole('rowheader')).toHaveTextContent('2m')
      await expect(within(rows[5] as HTMLElement).getByRole('cell')).toHaveTextContent('13.4k')
      await expect(canvasElement.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    await step('Tab reaches the plot, draws its ring and reads the latest point', async () => {
      await userEvent.tab()
      await expect(plot).toHaveFocus()
      await expect(getComputedStyle(plot).outlineStyle).toBe('solid')
      await expect(plot).toHaveAttribute('aria-valuetext', '4m 12s: 7k')
      await expect(readout(canvasElement)).toBe('4m 12s7k')
    })

    await step('The arrows walk the points, Home and End jump to the ends', async () => {
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
      await expect(plot).toHaveAttribute('aria-valuetext', '3m 30s: 10.4k')
      await expect(plot).toHaveAttribute('aria-valuenow', '7')
      await userEvent.keyboard('{Home}')
      await expect(plot).toHaveAttribute('aria-valuetext', '0m: 0')
      await userEvent.keyboard('{ArrowDown}')
      await expect(plot).toHaveAttribute('aria-valuenow', '0')
      await userEvent.keyboard('{End}')
      await expect(plot).toHaveAttribute('aria-valuetext', '4m 12s: 7k')
    })

    await step('Escape hides the readout and keeps focus; an arrow shows it again', async () => {
      await userEvent.keyboard('{Escape}')
      await expect(readout(canvasElement)).toBeNull()
      await expect(plot).toHaveFocus()
      await userEvent.keyboard('{ArrowLeft}')
      await expect(readout(canvasElement)).toBe('4m7.9k')
      plot.blur()
      await waitFor(() => expect(readout(canvasElement)).toBeNull())
    })

    await step('The pointer snaps to the nearest point and leaving hides it', async () => {
      const box = plot.getBoundingClientRect()
      // A little past 2m: the nearest point is 2m's peak, not the pointer's exact x.
      fireEvent.pointerMove(plot, { clientX: box.left + box.width * (2.1 / 4.2), clientY: box.top + 8 })
      await waitFor(() => expect(readout(canvasElement)).toBe('2m13.4k'))
      await expect(plot).toHaveAttribute('aria-valuetext', '2m: 13.4k')
      fireEvent.pointerMove(plot, { clientX: box.left + box.width * (2.6 / 4.2), clientY: box.top + 8 })
      await waitFor(() => expect(readout(canvasElement)).toBe('2m 30s6.1k'))
      // React reads a leave from `pointerout` to an element outside.
      fireEvent.pointerOut(plot, { relatedTarget: canvasElement.ownerDocument.body })
      await waitFor(() => expect(readout(canvasElement)).toBeNull())
    })
  },
}

/** Only the line, for a chart beside others where the fill would weigh too much. */
export const NoArea: Story = {
  args: { area: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('svg path')).toHaveLength(1)
  },
}

/** While the data loads, a placeholder the chart's size holds its place, so nothing moves when it arrives. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('progressbar', { name: 'Loading chart' })).toBeInTheDocument()
    await expect(canvas.queryByRole('slider')).toBeNull()
    await expect(canvas.queryByRole('table')).toBeNull()
  },
}

/** At 280px, the narrowest panel it lives in: fewer labels along the bottom, and the readout flips to stay inside. */
export const Narrow: Story = {
  args: { className: 'w-70' },
  render: (args) => <LineChart {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const plot = canvas.getByRole('slider')

    await step('One label a minute along the bottom', async () => {
      await waitFor(() =>
        expect(xLabels(canvasElement).map((tick) => tick.textContent)).toEqual(['0m', '1m', '2m', '3m', '4m']),
      )
    })

    await step("The labels don't touch", async () => {
      await expect(labelsOverlap(canvasElement)).toBe(false)
    })

    await step('The readout opens to the left past the middle, inside the chart', async () => {
      plot.focus()
      await userEvent.keyboard('{End}')
      const tooltip = canvasElement.querySelector('[data-side]') as HTMLElement
      await expect(tooltip).toHaveAttribute('data-side', 'left')
      await userEvent.keyboard('{Home}')
      await expect(tooltip).toHaveAttribute('data-side', 'right')
      plot.blur()
    })
  },
}

/** The x axis's labels, as drawn. */
function xLabels(canvasElement: HTMLElement) {
  return [...canvasElement.querySelectorAll<SVGTextElement>('text[data-tick-x]')]
}

/** Whether any two of the x axis's labels touch. */
function labelsOverlap(canvasElement: HTMLElement) {
  const boxes = xLabels(canvasElement)
    .map((label) => label.getBoundingClientRect())
    .sort((a, b) => a.left - b.left)
  return boxes.some((box, index) => index > 0 && box.left < (boxes[index - 1] as DOMRect).right)
}

/** The run's next reading, every 30 seconds after the last: a made-up but steady wave, so the story never ends. */
function nextReading(previous: LineChartPoint, step: number): LineChartPoint {
  return { x: previous.x + 0.5, y: Math.round(9000 + Math.sin(step * 1.3) * 3500 + ((step * 2861) % 1700)) }
}

/**
 * A run still going: a reading arrives every second and the line glides to make room for it. With `maxPoints`, once
 * twelve are in view the oldest leave on the left and the chart scrolls.
 */
export const Live: Story = {
  args: { maxPoints: 12, summary: undefined },
  argTypes: { maxPoints: { control: { type: 'range', min: 4, max: 40 } } },
  render: function LiveRender(args) {
    // Run #128's readings and three more, so the window is full from the start.
    const [data, setData] = useState(() =>
      [0, 1, 2].reduce(
        (points) => [...points, nextReading(points.at(-1) as LineChartPoint, points.length)],
        TOKENS_PER_MINUTE,
      ),
    )
    useEffect(() => {
      const timer = setInterval(() => {
        setData((points) => {
          const last = points.at(-1) as LineChartPoint
          return [...points, nextReading(last, points.length)].slice(-100)
        })
      }, 1000)
      return () => clearInterval(timer)
    }, [])
    return (
      <div className="sb-box-l">
        <LineChart {...args} data={data} />
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    function firstX() {
      return within(canvas.getByRole('table')).getAllByRole('rowheader')[0]?.textContent
    }

    await step('Twelve points in view, the oldest gone', async () => {
      await expect(within(canvas.getByRole('table')).getAllByRole('rowheader')).toHaveLength(12)
      await expect(firstX()).toBe('30s')
    })

    await step('A new reading scrolls the window by one and glides the line there', async () => {
      const series = canvasElement.querySelector('[data-glide="series"]') as SVGGElement
      await waitFor(() => expect(firstX()).toBe('1m'), { timeout: 2000 })
      await expect(within(canvas.getByRole('table')).getAllByRole('rowheader')).toHaveLength(12)
      await expect(series.getAnimations().length).toBeGreaterThan(0)
    })

    await step("The labels along the bottom don't touch", async () => {
      await expect(xLabels(canvasElement).length).toBeGreaterThan(2)
      await expect(labelsOverlap(canvasElement)).toBe(false)
    })
  },
}
