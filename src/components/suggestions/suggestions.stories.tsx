import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { PromptInput } from '@/components/prompt-input'

import { Suggestions } from '.'

/** How long the pretend agent takes to answer a sent prompt before it suggests again, in ms. */
const ANSWER_DURATION = 1500

/**
 * What run #128 suggests once its summary is written. A function the stories call, not a component, so the code panel
 * shows the markup.
 */
function runSuggestions() {
  return (
    <>
      <Suggestions.Item>Add annual prices</Suggestions.Item>
      <Suggestions.Item value="Only include prices for customers in the EU">Only EU</Suggestions.Item>
      <Suggestions.Item>Compare with last quarter</Suggestions.Item>
      <Suggestions.Item>Retry Orbit&apos;s pricing page</Suggestions.Item>
    </>
  )
}

/**
 * Whether a side of a `scroll-fade-x` row fades, read from where its mask layer sits: the start's layer shows its fade
 * at `0px` (out of view at `-64px`), the end's at `-64px` (out of view at `0px`).
 */
function fades(list: HTMLElement, side: 'start' | 'end') {
  const [start, end] = getComputedStyle(list)
    .maskPosition.split(',')
    .map((layer) => Number.parseFloat(layer))
  return side === 'start' ? start === 0 : end === -64
}

const meta = {
  title: 'AI/Conversation/Suggestions',
  component: Suggestions,
  argTypes: {
    children: { table: { disable: true } },
    scrollLabels: { table: { disable: true } },
  },
  args: { onSelect: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Follow-up prompts under a conversation, as chips that fill the prompt rather than send it, so the person can still edit what they picked. A chip can put more in the prompt than it shows (`value`). A row that doesn't fit scrolls sideways, like Tabs.",
      },
    },
  },
  render: (args) => (
    <div className="sb-box-l">
      <Suggestions {...args}>{runSuggestions()}</Suggestions>
    </div>
  ),
} satisfies Meta<typeof Suggestions>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
  play: async ({ args, canvas, step }) => {
    const list = canvas.getByRole('list', { name: 'Suggestions' })
    const annual = canvas.getByRole('button', { name: 'Add annual prices' })

    await step('A named list of chips, each a button in its own item', async () => {
      await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
      await expect(canvas.getAllByRole('button')).toHaveLength(4)
      await expect(list).toContainElement(annual)
    })

    await step('A click hands the chip’s words to onSelect', async () => {
      await userEvent.click(annual)
      await expect(args.onSelect).toHaveBeenLastCalledWith('Add annual prices')
    })

    await step('A chip with a value hands over its value, not its words', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Only EU' }))
      await expect(args.onSelect).toHaveBeenLastCalledWith('Only include prices for customers in the EU')
    })

    await step('The chips rise in one after another', async () => {
      const [first, , third] = canvas.getAllByRole('listitem') as [HTMLElement, HTMLElement, HTMLElement]
      await expect(getComputedStyle(first).animationName).toBe('rise')
      await expect(getComputedStyle(first).animationDelay).toBe('0s')
      await expect(getComputedStyle(third).animationDelay).toBe('0.1s')
    })
  },
}

/** The keyboard: Tab moves from chip to chip, Enter or Space picks one. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, step }) => {
    const annual = canvas.getByRole('button', { name: 'Add annual prices' })
    const onlyEu = canvas.getByRole('button', { name: 'Only EU' })

    await step('Tab reaches the first chip, and its ring draws', async () => {
      await userEvent.tab()
      await expect(annual).toHaveFocus()
      await expect(getComputedStyle(annual).outlineStyle).toBe('solid')
    })

    await step('Enter picks it', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(args.onSelect).toHaveBeenLastCalledWith('Add annual prices')
    })

    await step('Tab moves to the next chip, Space picks it', async () => {
      await userEvent.tab()
      await expect(onlyEu).toHaveFocus()
      await userEvent.keyboard(' ')
      await expect(args.onSelect).toHaveBeenLastCalledWith('Only include prices for customers in the EU')
      annual.blur()
    })
  },
}

/** Chips can lead with an icon, for a suggestion that does something other than ask. */
export const WithIcons: Story = {
  render: (args) => (
    <div className="sb-box-l">
      <Suggestions {...args}>
        <Suggestions.Item icon="retry">Retry Orbit&apos;s pricing page</Suggestions.Item>
        <Suggestions.Item icon="file">Open the summary</Suggestions.Item>
        <Suggestions.Item icon="edit">Draft the email again</Suggestions.Item>
      </Suggestions>
    </div>
  ),
}

/** While the agent is still writing, `disabled` turns every chip off; one chip can be turned off on its own too. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, step }) => {
    await step('Every chip is off, and a click picks nothing', async () => {
      for (const chip of canvas.getAllByRole('button')) await expect(chip).toBeDisabled()
      await userEvent.click(canvas.getByRole('button', { name: 'Add annual prices' }), { pointerEventsCheck: 0 })
      await expect(args.onSelect).not.toHaveBeenCalled()
    })
  },
}

/** When the chips don't fit, the row scrolls sideways, and each side that hides chips fades out with a chevron. */
export const Overflow: Story = {
  render: (args) => (
    <div className="sb-box-m">
      <Suggestions {...args}>{runSuggestions()}</Suggestions>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const list = canvas.getByRole('list')
    const row = list.parentElement as HTMLElement
    // By label: a chevron while invisible has no accessible name to find it by role.
    const back = canvas.getByLabelText('Scroll suggestions back')
    const forward = canvas.getByLabelText('Scroll suggestions forward')

    await step('At the start, only the end fades, with its chevron', async () => {
      await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
      await waitFor(() => expect(row).toHaveAttribute('data-overflow-end'))
      await expect(row).not.toHaveAttribute('data-overflow-start')
      // The shared fade reads the row's attributes: the end's layer slides into view, the start's stays out.
      await waitFor(() => expect([fades(list, 'start'), fades(list, 'end')]).toEqual([false, true]))
      // Pointer-only: Tab already moves along the row and scrolls each chip into view.
      await expect(forward).toHaveAttribute('tabindex', '-1')
      await expect(getComputedStyle(back.parentElement as HTMLElement).visibility).toBe('hidden')
    })

    await step('Tab reaches the last chip and scrolls it clear of the fade', async () => {
      const last = canvas.getByRole('button', { name: "Retry Orbit's pricing page" })
      last.focus()
      await waitFor(() => expect(row).not.toHaveAttribute('data-overflow-end'))
      await expect(row).toHaveAttribute('data-overflow-start')
      // Both layers slide, so wait for the end's to finish leaving too.
      await waitFor(() => expect([fades(list, 'start'), fades(list, 'end')]).toEqual([true, false]))
      await expect(last.getBoundingClientRect().right).toBeLessThanOrEqual(list.getBoundingClientRect().right + 1)
      last.blur()
    })

    await step('The start chevron scrolls a page back', async () => {
      await userEvent.click(back)
      await waitFor(() => expect(row).toHaveAttribute('data-overflow-end'))
    })

    await step('The end chevron scrolls a page forward', async () => {
      await userEvent.click(forward)
      await waitFor(() => expect(row).not.toHaveAttribute('data-overflow-end'))
    })
  },
}

/**
 * Under a prompt input: a chip fills the prompt and focuses it, ready to edit or send. Sending clears the chips, and
 * new ones rise in once the agent answers.
 */
export const WithPromptInput: Story = {
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const [prompt, setPrompt] = useState('')
    const [answering, setAnswering] = useState(false)
    return (
      <div className="sb-box-l sb-stack sb-stack--stretch">
        {!answering && (
          <Suggestions
            onSelect={(value) => {
              args.onSelect(value)
              setPrompt(value)
              promptRef.current?.focus()
            }}
          >
            {runSuggestions()}
          </Suggestions>
        )}
        <PromptInput
          ref={promptRef}
          value={prompt}
          onValueChange={setPrompt}
          running={answering}
          onSubmit={() => {
            setPrompt('')
            setAnswering(true)
            setTimeout(() => setAnswering(false), ANSWER_DURATION)
          }}
        />
      </div>
    )
  },
  play: async ({ args, canvas, step }) => {
    const textarea = canvas.getByRole('textbox')

    await step('A chip fills the prompt and focuses it, the cursor at the end', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Only EU' }))
      await expect(args.onSelect).toHaveBeenLastCalledWith('Only include prices for customers in the EU')
      await expect(textarea).toHaveValue('Only include prices for customers in the EU')
      await expect(textarea).toHaveFocus()
      const end = (textarea as HTMLTextAreaElement).value.length
      await expect((textarea as HTMLTextAreaElement).selectionStart).toBe(end)
    })

    await step('Sending clears the chips until the agent answers', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(canvas.queryByRole('list')).not.toBeInTheDocument()
      await waitFor(() => expect(canvas.getByRole('list', { name: 'Suggestions' })).toBeInTheDocument(), {
        timeout: ANSWER_DURATION * 2,
      })
      textarea.blur()
    })
  },
}
