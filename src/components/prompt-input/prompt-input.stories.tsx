import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent } from 'storybook/test'

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
export const Running: Story = { args: { running: true, defaultValue: 'Find senior design engineer roles in Madrid' } }

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
      await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled()
    })
    await step('Shift + Enter adds a line', async () => {
      await userEvent.type(prompt, 'Find roles{Shift>}{Enter}{/Shift}in Madrid')
      await expect(prompt).toHaveValue('Find roles\nin Madrid')
    })
    await step('Enter sends it, and the prompt clears', async () => {
      await userEvent.keyboard('{Enter}')
      await expect(args.onSubmit).toHaveBeenCalledWith('Find roles\nin Madrid')
      await expect(prompt).toHaveValue('')
    })
  },
}
