import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { PromptInput } from '.'

const MODELS = [
  { value: 'fast', label: 'Fast' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'deep', label: 'Deep' },
]

/** How long the pretend run lasts after a prompt is sent, in ms. */
const RUN_DURATION = 2500

const meta = {
  title: 'AI/Conversation/Prompt input',
  component: PromptInput,
  tags: ['beta'],
  argTypes: {
    running: { control: 'boolean' },
    models: { table: { disable: true } },
    labels: { table: { disable: true } },
    stream: { table: { disable: true } },
  },
  args: {
    onSubmit: fn(),
    onStop: fn(),
    onAttach: fn(),
    models: MODELS,
    defaultModel: 'balanced',
  },
  // The story plays the app: sending starts a short pretend run, and dictation toggles without a microphone.
  render: function Render(args) {
    const [running, setRunning] = useState(false)
    const [recording, setRecording] = useState(false)
    return (
      <div className="sb-box-l">
        <PromptInput
          {...args}
          running={args.running || running}
          onSubmit={(prompt) => {
            args.onSubmit(prompt)
            setRunning(true)
            setTimeout(() => setRunning(false), RUN_DURATION)
          }}
          onStop={() => {
            args.onStop?.()
            setRunning(false)
          }}
          recording={recording}
          onRecordingChange={setRecording}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        component:
          "Where a person asks an agent for something: a text area that grows as they write, a toolbar with attachments, the model and dictation, and a send button that becomes a stop button while the agent runs. Enter sends, Shift + Enter adds a line. Idea from React Bits' Prompt Bar.",
      },
    },
  },
} satisfies Meta<typeof PromptInput>

export default meta
type Story = StoryObj<typeof meta>

/** Write a prompt and send it: the agent "runs" for a moment, with a stop button in place of send. */
export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** While the agent runs: send becomes stop. */
export const Running: Story = {
  args: { running: true, defaultValue: "Compare our competitors' pricing for team plans" },
}

/** Only the text and the send button: everything in the toolbar is optional. */
export const Minimal: Story = {
  args: { models: undefined, onAttach: undefined },
  render: (args) => (
    <div className="sb-box-l">
      <PromptInput {...args} />
    </div>
  ),
}

/** Enter sends, Shift + Enter adds a line, and an empty prompt can't be sent. */
export const Keyboard: Story = {
  play: async ({ args, canvas, step }) => {
    const prompt = canvas.getByRole('textbox', { name: 'Prompt' })

    await step('An empty prompt can’t be sent', async () => {
      await expect(canvas.getByRole('button', { name: 'Send' })).toHaveAttribute('aria-disabled', 'true')
    })
    await step('Shift + Enter adds a line', async () => {
      await userEvent.type(prompt, 'Compare pricing{Shift>}{Enter}{/Shift}for teams')
      await expect(prompt).toHaveValue('Compare pricing\nfor teams')
    })
    await step('Enter sends it, and the prompt clears', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(args.onSubmit).toHaveBeenCalledWith('Compare pricing\nfor teams')
      await expect(prompt).toHaveValue('')
    })
  },
}

/**
 * On an empty prompt the send button is off but still says what it does: hovering or tabbing to it opens its tooltip,
 * and clicking it sends nothing.
 */
export const SendTooltip: Story = {
  name: 'Send tooltip',
  parameters: { controls: { disable: true } },
  play: async ({ args, canvas, canvasElement, step }) => {
    const send = canvas.getByRole('button', { name: 'Send' })
    const page = within(canvasElement.ownerDocument.body)

    await step('Hovering the off button opens its tooltip', async () => {
      await userEvent.hover(send)
      await waitFor(() => expect(page.getByText('Send')).toBeVisible())
    })
    await step('Clicking it sends nothing', async () => {
      await userEvent.click(send)
      await expect(args.onSubmit).not.toHaveBeenCalled()
    })
  },
}
