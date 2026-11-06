import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect, waitFor } from 'storybook/test'

import { Button } from '@/components/button'
import { Link } from '@/components/link'

import { StreamingText, type StreamingTextProps } from '.'
import { STREAMING_TEXT_REVEALS } from './streaming-text.const'

/** The Research agent's summary of run #128. */
const SUMMARY = `Three of our five competitors raised their seat prices for teams of 10 to 50 this quarter, and one cut its annual discount.

- **Fieldnote** went from $12 to $14 a seat a month. [1]
- **Brightloop** went from $15 to $16, and now starts at 10 seats. [2]
- **Kitewise** went from $9 to $11. [3]
- **Tandem** kept its $13 seat price but cut its annual discount from 20% to 15%. [4]

Orbit's pricing page timed out, so its row uses last quarter's archived version.

Next, with your approval:

1. Save this summary to the Q3 pricing report.
2. Email it to the leadership team.`

const SOURCES = ['Fieldnote', 'Brightloop', 'Kitewise', 'Tandem']

const meta = {
  title: 'AI/Conversation/Streaming text',
  component: StreamingText,
  tags: ['beta'],
  argTypes: {
    text: { control: 'text' },
    reveal: { control: 'inline-radio', options: STREAMING_TEXT_REVEALS },
    renderCitation: { table: { disable: true } },
  },
  args: { text: SUMMARY },
  parameters: {
    docs: {
      description: {
        component:
          'Text an agent writes as it arrives, with paragraphs, lists, bold and citation markers. Bursts of tokens come out at a steady pace, and syntax cut off mid-stream waits for the rest instead of flashing. Screen readers hear each paragraph once it is complete, never word by word.',
      },
    },
  },
  render: (args) => (
    <div className="sb-box-l">
      <StreamingText {...args} />
    </div>
  ),
} satisfies Meta<typeof StreamingText>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ canvas, canvasElement, step }) => {
    await step('Paragraphs and lists are real paragraphs and lists', async () => {
      await expect(canvasElement.querySelectorAll('p')).toHaveLength(3)
      const [bullets, steps] = canvas.getAllByRole('list')
      await expect(bullets?.tagName).toBe('UL')
      await expect(steps?.tagName).toBe('OL')
      await expect(canvas.getAllByRole('listitem')).toHaveLength(6)
    })

    await step('Bold is strong, and citations stay as written', async () => {
      await expect(canvas.getByText('Fieldnote').tagName).toBe('STRONG')
      await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent(
        'Fieldnote went from $12 to $14 a seat a month. [1]',
      )
    })

    await step('Text that never streamed has no caret, no word spans and announces nothing', async () => {
      const status = canvas.getByRole('status')
      await expect(status.parentElement?.querySelector('[aria-hidden="true"]')).toBeNull()
      // Only the citation keeps a span of its own.
      await expect(canvas.getAllByRole('listitem')[2]?.querySelectorAll('span')).toHaveLength(1)
      await expect(status).toBeEmptyDOMElement()
    })
  },
}

/** A pretend stream with a Replay button, in the reveal the story's controls pick. */
function streamRender(args: StreamingTextProps) {
  return <Replayable reveal={args.reveal} />
}

/**
 * The summary arriving in uneven bursts, as a model sends it: the words come out evenly, each rising 4px into place,
 * and the caret follows them.
 */
export const Streaming: Story = {
  parameters: { controls: { include: ['reveal'] } },
  render: streamRender,
  play: async ({ canvas, canvasElement, step }) => {
    const root = canvasElement.querySelector('[data-writing]') as HTMLElement
    const status = canvas.getByRole('status')

    await step('New words rise into place', async () => {
      const word = await waitFor(() => newWord(canvasElement))
      await expect(getComputedStyle(word).display).toBe('inline-block')
      await expect(getComputedStyle(word).transitionProperty).toContain('translate')
    })

    await step('While it writes, a caret follows the words, hidden from screen readers', async () => {
      await expect(root).toBeInTheDocument()
      const caret = root.querySelector('[aria-hidden="true"]') as HTMLElement
      await expect(caret).toBeInTheDocument()
      await expect(getComputedStyle(caret).opacity).toBe('1')
    })

    await step('A paragraph is announced once the next one starts, not word by word', async () => {
      await waitFor(() => expect(status).toHaveTextContent(/^Three of our five competitors .* annual discount\.$/), {
        timeout: 8000,
      })
    })

    await step('When the stream ends, the last item is announced and the caret fades out', async () => {
      await waitFor(() => expect(status).toHaveTextContent('Email it to the leadership team.'), { timeout: 8000 })
      await waitFor(() => expect(root).not.toHaveAttribute('data-writing'))
      await expect(root).toHaveTextContent('Email it to the leadership team.')
      const caret = root.querySelector('[aria-hidden="true"]') as HTMLElement
      await waitFor(() => expect(getComputedStyle(caret).opacity).toBe('0'))
    })

    await step('Once the last word has faded in, words merge back into plain text', async () => {
      // Only the citation keeps a span of its own, so it never remounts.
      await waitFor(() => expect(canvas.getAllByRole('listitem')[2]?.querySelectorAll('span')).toHaveLength(1))
    })
  },
}

/** Each new word only fades in, with no movement. */
export const RevealFade: Story = {
  name: 'Reveal: fade',
  args: { reveal: 'fade' },
  parameters: { controls: { disable: true } },
  render: streamRender,
  play: async ({ canvasElement, step }) => {
    await step('New words stay inline and transition only their opacity', async () => {
      const word = await waitFor(() => newWord(canvasElement))
      await expect(getComputedStyle(word).display).toBe('inline')
      await expect(getComputedStyle(word).transitionProperty).toBe('opacity')
    })
  },
}

/** Each new word clears a 4px blur as it fades in, like ink settling. */
export const RevealBlur: Story = {
  name: 'Reveal: blur',
  args: { reveal: 'blur' },
  parameters: { controls: { disable: true } },
  render: streamRender,
  play: async ({ canvasElement, step }) => {
    await step('New words transition their blur', async () => {
      const word = await waitFor(() => newWord(canvasElement))
      await expect(getComputedStyle(word).transitionProperty).toContain('filter')
    })
  },
}

/** Each new word arrives in accent ink and dries to the text's color, showing where the pen is without moving. */
export const RevealInk: Story = {
  name: 'Reveal: ink',
  args: { reveal: 'ink' },
  parameters: { controls: { disable: true } },
  render: streamRender,
  play: async ({ canvasElement, step }) => {
    await step('New words transition their color', async () => {
      const word = await waitFor(() => newWord(canvasElement))
      await expect(getComputedStyle(word).transitionProperty).toContain('color')
    })
  },
}

/** Citations rendered as links to their sources, through `renderCitation`. */
export const Citations: Story = {
  args: {
    renderCitation: (index) => (
      <Link href={`#source-${index}`} aria-label={`Source ${index}: ${SOURCES[index - 1]}`}>
        [{index}]
      </Link>
    ),
  },
  play: async ({ canvas, step }) => {
    await step('Each marker becomes a link named by its source', async () => {
      await expect(canvas.getAllByRole('link')).toHaveLength(4)
      await expect(canvas.getByRole('link', { name: 'Source 4: Tandem' })).toHaveAttribute('href', '#source-4')
    })
  },
}

/** How often a pretend chunk lands, in ms, and how many characters each brings: uneven, like a model's tokens. */
const CHUNK_TIME = 80
const CHUNK_SIZES = [4, 22, 9, 2, 31, 12, 6, 18]

/**
 * The summary as a model would send it: a chunk of uneven size every 80ms, then done. A story helper, so it stays out
 * of the code panel's markup.
 */
function PretendStream({ reveal }: Pick<StreamingTextProps, 'reveal'>) {
  const [length, setLength] = useState(0)
  const [chunk, setChunk] = useState(0)
  const streaming = length < SUMMARY.length

  useEffect(() => {
    if (!streaming) return
    const timer = window.setTimeout(() => {
      setLength(length + (CHUNK_SIZES[chunk % CHUNK_SIZES.length] ?? 1))
      setChunk(chunk + 1)
    }, CHUNK_TIME)
    return () => window.clearTimeout(timer)
  }, [streaming, length, chunk])

  return <StreamingText text={SUMMARY.slice(0, length)} streaming={streaming} reveal={reveal} />
}

/** A pretend stream and a button that plays it again. A story helper, so it stays out of the code panel's markup. */
function Replayable({ reveal }: Pick<StreamingTextProps, 'reveal'>) {
  const [run, setRun] = useState(0)
  return (
    <div className="sb-stack">
      <div className="sb-box-l">
        <PretendStream key={run} reveal={reveal} />
      </div>
      <Button variant="secondary" size="s" onClick={() => setRun(run + 1)}>
        Replay
      </Button>
    </div>
  )
}

/** The first word of the stream while it's still a word of its own (a span), for checking how words come in. */
function newWord(canvasElement: HTMLElement) {
  const word = canvasElement.querySelector<HTMLElement>('p > span:not([aria-hidden])')
  if (!word) throw new Error('No word yet')
  return word
}
