import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Citation, type CitationSource } from '.'

/** Where run #128's summary got its facts: four pricing pages and last quarter's report, in the order it cites them. */
const SOURCES = [
  {
    href: 'https://fieldnote.example/pricing',
    title: 'Fieldnote pricing',
    excerpt: 'Team: $14 per seat a month, billed annually, for 10 to 50 seats.',
  },
  {
    href: 'https://brightloop.example/pricing',
    title: 'Pricing: plans for every team',
    excerpt: 'Team: $16 per seat a month, billed annually. Starts at 10 seats.',
  },
  {
    href: 'https://kitewise.example/pricing',
    title: 'Kitewise pricing',
    excerpt: 'Growth: $11 per seat a month for teams of 10 to 50.',
  },
  {
    href: 'https://www.tandem.example/plans',
    title: 'Tandem plans and pricing',
    excerpt: 'Business: $13 per seat a month. Save 15% when you pay yearly.',
  },
  {
    href: '/files/reports/pricing-q2.md',
    title: 'Competitor pricing, Q2',
    excerpt: "Fieldnote's Team plan was $12 per seat, and Tandem took 20% off a yearly plan.",
  },
] as const satisfies CitationSource[]

/** Brightloop's mark as a data URL, so the favicon story needs no network. */
const BRIGHTLOOP_FAVICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="4" fill="#f59e0b"/><circle cx="8" cy="8" r="3.5" fill="#fff"/></svg>',
)}`

/** The preview, which opens in a portal at the end of the page, outside the story's canvas. */
function page(canvasElement: HTMLElement) {
  return within(canvasElement.ownerDocument.body)
}

const meta = {
  title: 'AI/Sources/Citation',
  component: Citation,
  tags: ['beta'],
  argTypes: {
    index: { control: { type: 'range', min: 1, max: 20 } },
    delay: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
    excerpt: { control: 'text' },
  },
  args: { index: 2, ...SOURCES[1] },
  parameters: {
    docs: {
      description: {
        component:
          "A numbered marker in an agent's answer that links to a source and previews it on hover or focus: its site, its title and the passage the agent used. Hand it to `StreamingText`'s `renderCitation`. Built on Base UI's PreviewCard.",
      },
    },
  },
  render: (args) => (
    <p className="max-w-120 text-body text-ink">
      Brightloop went from $15 to $16 a seat, and now starts at 10 seats <Citation {...args} />.
    </p>
  ),
} satisfies Meta<typeof Citation>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, canvasElement, step }) => {
    const citation = canvas.getByRole('link', { name: 'Source 2: Pricing: plans for every team (opens in a new tab)' })

    await step('A link to the source, in a new tab that cannot reach back', async () => {
      await expect(citation).toHaveTextContent('2')
      await expect(citation).toHaveAttribute('href', 'https://brightloop.example/pricing')
      await expect(citation).toHaveAttribute('target', '_blank')
      await expect(citation).toHaveAttribute('rel', 'noopener noreferrer')
    })

    const rest = getComputedStyle(citation).backgroundColor

    await step('Hovering previews the site, the title and the quoted passage', async () => {
      await userEvent.hover(citation)
      await waitFor(() => expect(page(canvasElement).getByText('Pricing: plans for every team')).toBeVisible())
      await expect(page(canvasElement).getByText('brightloop.example')).toBeVisible()
      await expect(page(canvasElement).getByText(SOURCES[1].excerpt).tagName).toBe('BLOCKQUOTE')
    })

    await step('The chip takes the accent while its preview is open', async () => {
      await expect(citation).toHaveAttribute('data-popup-open')
      await waitFor(() => expect(getComputedStyle(citation).backgroundColor).not.toBe(rest))
    })

    await step('Leaving closes it', async () => {
      await userEvent.unhover(citation)
      await waitFor(() => expect(page(canvasElement).queryByText('Pricing: plans for every team')).toBeNull())
    })
  },
}

/** In an answer: each fact carries the number of the source it came from, and two sources can back one fact. */
export const InAnAnswer: Story = {
  name: 'In an answer',
  parameters: { controls: { disable: true } },
  render: () => (
    <p className="max-w-120 text-body text-ink">
      Fieldnote went from $12 to $14 a seat a month <Citation index={1} {...SOURCES[0]} />{' '}
      <Citation index={5} {...SOURCES[4]} />, and Tandem cut its annual discount from 20% to 15%{' '}
      <Citation index={4} {...SOURCES[3]} />. Brightloop <Citation index={2} {...SOURCES[1]} /> and Kitewise{' '}
      <Citation index={3} {...SOURCES[2]} /> raised their seat prices too.
    </p>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    await step('Every marker is a link named by its source', async () => {
      await expect(canvas.getAllByRole('link')).toHaveLength(5)
      await expect(canvas.getByRole('link', { name: /^Source 4: Tandem plans and pricing/ })).toBeVisible()
    })

    const first = canvas.getByRole('link', { name: /^Source 1:/ })

    await step('Tab reaches it, draws the ring and opens its preview', async () => {
      await userEvent.tab()
      await expect(first).toHaveFocus()
      await expect(getComputedStyle(first).outlineStyle).toBe('solid')
      await waitFor(() => expect(page(canvasElement).getByText('Fieldnote pricing')).toBeVisible())
    })

    await step('Escape closes it and keeps focus on the marker', async () => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(page(canvasElement).queryByText('Fieldnote pricing')).toBeNull())
      await expect(first).toHaveFocus()
    })

    await step('The next tab moves to the next source', async () => {
      await userEvent.tab()
      const next = canvas.getByRole('link', { name: /^Source 5:/ })
      await expect(next).toHaveFocus()
      next.blur()
    })
  },
}

/** With the site's favicon beside its name. */
export const WithFavicon: Story = {
  name: 'With a favicon',
  args: { favicon: BRIGHTLOOP_FAVICON },
  play: async ({ canvas, canvasElement, step }) => {
    await step('The favicon shows, decorative beside the name', async () => {
      await userEvent.hover(canvas.getByRole('link'))
      await waitFor(() => expect(page(canvasElement).getByText('brightloop.example')).toBeVisible())
      const favicon = canvasElement.ownerDocument.querySelector(`img[src="${BRIGHTLOOP_FAVICON}"]`)
      await expect(favicon).toHaveAttribute('alt', '')
      await userEvent.unhover(canvas.getByRole('link'))
    })
  },
}

/** A favicon that doesn't load gives way to the site's first letter. */
export const BrokenFavicon: Story = {
  name: "When the favicon doesn't load",
  args: { favicon: '/brightloop-favicon-missing.png' },
  play: async ({ canvas, canvasElement, step }) => {
    await step('The first letter stands in', async () => {
      await userEvent.hover(canvas.getByRole('link'))
      await waitFor(() => expect(page(canvasElement).getByText('b')).toBeVisible())
      await expect(canvasElement.ownerDocument.querySelector('img[src="/brightloop-favicon-missing.png"]')).toBeNull()
      await userEvent.unhover(canvas.getByRole('link'))
    })
  },
}

/** A file in the workspace: it opens in the same tab, and there's no site to show above the title. */
export const InTheApp: Story = {
  name: 'A page in the app',
  args: { index: 5, ...SOURCES[4] },
  render: (args) => (
    <p className="max-w-120 text-body text-ink">
      Last quarter, Fieldnote charged $12 a seat <Citation {...args} />.
    </p>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const citation = canvas.getByRole('link', { name: 'Source 5: Competitor pricing, Q2' })

    await step('It stays in the tab, and says nothing about a new one', async () => {
      await expect(citation).not.toHaveAttribute('target')
      await expect(citation).toHaveAttribute('href', '/files/reports/pricing-q2.md')
    })

    await step('The preview has its title and passage, without a site', async () => {
      await userEvent.hover(citation)
      await waitFor(() => expect(page(canvasElement).getByText('Competitor pricing, Q2')).toBeVisible())
      await expect(page(canvasElement).queryByText(/\.example$/)).toBeNull()
      await userEvent.unhover(citation)
    })
  },
}

/** With no passage to quote, the preview is the site and the title. */
export const WithoutExcerpt: Story = {
  name: 'Without an excerpt',
  args: { excerpt: undefined },
}
