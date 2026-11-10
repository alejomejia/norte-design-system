import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { SourceList, type SourceListSource } from '.'

/** A competitor's mark as a data URL, so the stories need no network. */
function mark(shape: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${shape}</svg>`)}`
}

const FAVICONS = {
  fieldnote: mark('<rect width="16" height="16" rx="4" fill="#15803d"/><path d="M4 11h8M4 8h8M4 5h5" stroke="#fff"/>'),
  brightloop: mark('<rect width="16" height="16" rx="4" fill="#f59e0b"/><circle cx="8" cy="8" r="3.5" fill="#fff"/>'),
  kitewise: mark('<rect width="16" height="16" rx="4" fill="#7c3aed"/><path d="M8 3l4 5-4 5-4-5z" fill="#fff"/>'),
  tandem: mark(
    '<rect width="16" height="16" rx="4" fill="#2563eb"/><circle cx="6" cy="8" r="2.5" fill="#fff"/><circle cx="10" cy="8" r="2.5" fill="#fff" opacity=".6"/>',
  ),
}

/**
 * What run #128 read, in the order its summary cites them: four pricing pages, then Orbit's, which timed out. Orbit
 * has no favicon either, since its page never loaded: its first letter stands in.
 */
const SOURCES = [
  { href: 'https://fieldnote.example/pricing', title: 'Fieldnote pricing', favicon: FAVICONS.fieldnote },
  { href: 'https://brightloop.example/pricing', title: 'Pricing: plans for every team', favicon: FAVICONS.brightloop },
  { href: 'https://kitewise.example/pricing', title: 'Kitewise pricing', favicon: FAVICONS.kitewise },
  { href: 'https://www.tandem.example/plans', title: 'Tandem plans and pricing', favicon: FAVICONS.tandem },
  {
    href: 'https://orbit.example/pricing',
    title: 'Orbit pricing',
    status: 'failed',
    reason: 'Timed out after 30s',
  },
] satisfies SourceListSource[]

/** Last quarter's report, a file in the workspace. */
const Q2_REPORT = {
  href: '/files/reports/pricing-q2.md',
  title: 'Competitor pricing, Q2',
} satisfies SourceListSource

/**
 * A link's name as screen readers hear it. The words only they hear are `sr-only`, which testing-library reads as
 * blocks of their own, with spaces around them (see the recipe): the pattern lets punctuation have a space before it.
 */
function spoken(text: string) {
  const pattern = text
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s*([,:])\s*/g, '\\s*$1\\s+')
    .replace(/ /g, '\\s+')
  return new RegExp(`^${pattern}$`)
}

const meta = {
  title: 'AI/Sources/Source list',
  component: SourceList,
  tags: ['beta'],
  argTypes: { labels: { table: { disable: true } } },
  args: { sources: SOURCES, onOpenChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "The sources an agent's run read, folded under its answer to a count and their favicons. Open, each row links to its source, numbered like the answer's citations, and a source that failed says why. Built on Base UI's Collapsible.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-m">
      <SourceList {...args} />
    </div>
  ),
} satisfies Meta<typeof SourceList>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ args, canvas, step }) => {
    // The comma is `sr-only`, which testing-library reads as a block of its own (see the recipe).
    const trigger = canvas.getByRole('button', { name: spoken('5 sources, 1 failed') })

    await step('Folded: a button that says how many and how many failed', async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(canvas.queryByRole('list')).toBeNull()
    })

    await step('A click opens the list', async () => {
      await userEvent.click(trigger)
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(args.onOpenChange).toHaveBeenLastCalledWith(true, expect.anything())
      await expect(canvas.getAllByRole('link')).toHaveLength(5)
    })

    await step('Each row links to its source, numbered like the citations, in a new tab', async () => {
      const brightloop = canvas.getByRole('link', {
        name: spoken('Source 2: Pricing: plans for every team, brightloop.example (opens in a new tab)'),
      })
      await expect(brightloop).toHaveAttribute('href', 'https://brightloop.example/pricing')
      await expect(brightloop).toHaveAttribute('target', '_blank')
      await expect(brightloop).toHaveAttribute('rel', 'noopener noreferrer')
      await expect(
        canvas.getByRole('link', {
          name: spoken('Source 4: Tandem plans and pricing, tandem.example (opens in a new tab)'),
        }),
      ).toHaveAttribute('href', 'https://www.tandem.example/plans')
    })

    await step('The failed one takes no number and says why', async () => {
      const orbit = canvas.getByRole('link', {
        name: spoken('Orbit pricing, orbit.example, failed: Timed out after 30s (opens in a new tab)'),
      })
      // The last row to rise: visible once its turn comes.
      await waitFor(() => expect(orbit).toBeVisible())
      await expect(canvas.queryByRole('link', { name: /^Source 5/ })).toBeNull()
    })

    await step('A second click folds it again', async () => {
      await userEvent.click(trigger)
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await waitFor(() => expect(canvas.queryByRole('list')).toBeNull())
    })
  },
}

/** Open from the start, with every source a click away. */
export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ canvas, canvasElement, step }) => {
    const panel = canvasElement.querySelector<HTMLElement>('[data-open]:not(button)')

    await step('The panel grows to the list, and stops there', async () => {
      await expect(panel).not.toBeNull()
      await waitFor(() => expect(panel?.getBoundingClientRect().height).toBe(panel?.scrollHeight))
      await expect(panel?.getBoundingClientRect().height).toBeGreaterThan(0)
    })

    await step('The rows rise in one after another', async () => {
      const styles = canvas.getAllByRole('listitem').map((item) => getComputedStyle(item))
      await expect(styles.map((style) => style.animationName)).toEqual(Array(5).fill('rise'))
      await expect(styles.map((style) => style.animationDelay)).toEqual(['0s', '0.04s', '0.08s', '0.12s', '0.16s'])
    })

    await step('Numbers, titles and sites line up down the list', async () => {
      // The text's own box, not its cell's: titles start at one edge, sites end at the other.
      function edges(text: string) {
        const range = document.createRange()
        range.selectNodeContents(canvas.getByText(text))
        return range.getBoundingClientRect()
      }
      await expect(edges('Fieldnote pricing').left).toBe(edges('Tandem plans and pricing').left)
      await expect(edges('fieldnote.example').right).toBe(edges('tandem.example').right)
    })
  },
}

/** Every source read: the count stands alone, and every row has a number. */
export const AllRead: Story = {
  name: 'All read',
  args: { sources: SOURCES.slice(0, 4), defaultOpen: true },
  play: async ({ canvas, step }) => {
    await step('No failures to mention', async () => {
      await expect(canvas.getByRole('button', { name: '4 sources' })).toBeVisible()
      await expect(canvas.queryByText(/failed/)).toBeNull()
    })
  },
}

/** Without favicons, each site's first letter stands in, in the stack and in the rows. */
export const WithoutFavicons: Story = {
  name: 'Without favicons',
  args: { sources: SOURCES.map(({ favicon: _, ...source }) => source), defaultOpen: true },
  play: async ({ canvasElement, step }) => {
    await step('Letters instead of images', async () => {
      await expect(canvasElement.querySelector('img')).toBeNull()
    })
  },
}

/** A favicon that doesn't load gives way to its site's first letter. */
export const BrokenFavicon: Story = {
  name: "When a favicon doesn't load",
  args: {
    sources: SOURCES.map((source, index) =>
      index === 1 ? { ...source, favicon: '/brightloop-favicon-missing.png' } : source,
    ),
    defaultOpen: true,
  },
  play: async ({ canvasElement, step }) => {
    await step('The first letter stands in, wherever it shows', async () => {
      await waitFor(() => expect(canvasElement.querySelector('img[src="/brightloop-favicon-missing.png"]')).toBeNull())
    })
  },
}

/** A file in the workspace among the pages: it opens in the same tab, with a file for its icon and no site. */
export const InTheApp: Story = {
  name: 'A page in the app',
  args: { sources: [Q2_REPORT, ...SOURCES], defaultOpen: true },
  play: async ({ canvas, step }) => {
    await step('It stays in the tab, numbered first', async () => {
      const report = canvas.getByRole('link', { name: spoken('Source 1: Competitor pricing, Q2') })
      await expect(report).toHaveAttribute('href', '/files/reports/pricing-q2.md')
      await expect(report).not.toHaveAttribute('target')
    })
  },
}

/** By keyboard: Tab reaches the fold, Enter opens it, and Tab moves on through the rows. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button')

    await step('Tab reaches the fold and draws the ring', async () => {
      await userEvent.tab()
      await expect(trigger).toHaveFocus()
      await expect(getComputedStyle(trigger).outlineStyle).toBe('solid')
    })

    await step('Enter opens it', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    await step('Tab moves to the first source, ring and all', async () => {
      await userEvent.tab()
      const first = canvas.getByRole('link', {
        name: spoken('Source 1: Fieldnote pricing, fieldnote.example (opens in a new tab)'),
      })
      await expect(first).toHaveFocus()
      await expect(getComputedStyle(first).outlineStyle).toBe('solid')
    })

    await step('Back on the fold, Space folds it', async () => {
      await userEvent.tab({ shift: true })
      await userEvent.keyboard(' ')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      trigger.blur()
    })
  },
}

/** Disabled while the run still reads: the count shows, the list waits. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, step }) => {
    await step("A click doesn't open it", async () => {
      const trigger = canvas.getByRole('button')
      await userEvent.click(trigger, { pointerEventsCheck: 0 })
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  },
}
