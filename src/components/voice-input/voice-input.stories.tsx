import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { VoiceInput } from '.'
import { VOICE_INPUT_SIDES } from './voice-input.const'

const meta = {
  title: 'AI/Conversation/Voice input',
  component: VoiceInput,
  argTypes: {
    recording: { control: 'boolean' },
    side: { control: 'inline-radio', options: VOICE_INPUT_SIDES },
    stream: { table: { disable: true } },
    labels: { table: { disable: true } },
  },
  args: { recording: false, onRecordingChange: fn() },
  // A box as wide as the pill, so it has room to open; opening to the left, the mic sits at the box's right end.
  decorators: [
    (Story, { args }) => (
      <div className={args.side === 'left' ? 'sb-row sb-row--end sb-box-s' : 'sb-row sb-box-s'}>
        <Story />
      </div>
    ),
  ],
  // The story owns the recording state, as an app would; the bars move on their own, without a microphone.
  render: function Render(args) {
    const [recording, setRecording] = useState(args.recording)
    useEffect(() => setRecording(args.recording), [args.recording])
    return (
      <VoiceInput
        {...args}
        recording={recording}
        onRecordingChange={(next) => {
          args.onRecordingChange(next)
          setRecording(next)
        }}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        component:
          "Dictation for a prompt: a mic button that grows into a recording pill. It draws the recording; the app owns the microphone and the transcription. Idea from React Bits' Voice Pill.",
      },
    },
  },
} satisfies Meta<typeof VoiceInput>

export default meta
type Story = StoryObj<typeof meta>

/** Click the mic: the pill grows to the right, and the stop button takes the focus. */
export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Recording, with bars that move on their own: what it looks like without a microphone, as here. */
export const Recording: Story = { args: { recording: true } }

/**
 * `side="left"` for a mic at the right end of a toolbar, as in `PromptInput`: the pill opens over the toolbar, and the
 * stop button stays where the mic was.
 */
export const OpensToTheLeft: Story = {
  name: 'Opens to the left',
  args: { side: 'left' },
}

/**
 * With your microphone: it asks for permission, then the bars follow your voice. Nothing is recorded or sent; the
 * stream closes when you stop.
 */
export const WithYourMicrophone: Story = {
  name: 'With your microphone',
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [stream, setStream] = useState<MediaStream | null>(null)

    async function toggle(recording: boolean) {
      if (!recording) {
        for (const track of stream?.getTracks() ?? []) track.stop()
        setStream(null)
        return
      }
      setStream(await navigator.mediaDevices.getUserMedia({ audio: true }))
    }

    return <VoiceInput recording={stream !== null} onRecordingChange={toggle} stream={stream} />
  },
}

/** Focus follows the control: to the stop button while recording, back to the mic after. */
export const Focus: Story = {
  parameters: { controls: { disable: true } },
  play: async ({ canvas, step }) => {
    await step('Starting moves focus to the stop button', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Dictate' }))
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Stop recording' })).toHaveFocus())
    })
    await step('Stopping brings it back to the mic', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Stop recording' }))
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Dictate' })).toHaveFocus())
    })
  },
}
