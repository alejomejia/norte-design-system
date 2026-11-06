import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'

import { CodeField } from '.'

const meta = {
  title: 'Elements/Form controls/Code field',
  component: CodeField,
  tags: ['beta'],
  argTypes: {
    label: { control: 'text' },
    length: { control: { type: 'range', min: 4, max: 8 } },
    groupSize: { control: { type: 'range', min: 2, max: 4 } },
  },
  args: { label: 'Verification code', onValueComplete: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "A one-time code, one slot per character. Typing moves to the next slot, paste fills them all, and phones offer the code from a text message. Idea from React Bits' Code Slots.",
      },
    },
  },
} satisfies Meta<typeof CodeField>

export default meta
type Story = StoryObj<typeof meta>

/** Type a code, or paste one: each character drops into its slot. */
export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Four digits, in one group. */
export const Short: Story = { args: { length: 4, groupSize: 4, label: 'PIN' } }

/** Typing fills the slots in order and reports the code once it's complete. */
export const Typing: Story = {
  play: async ({ args, canvas, step }) => {
    await step('Six digits fill the six slots and complete the code', async () => {
      await userEvent.click(canvas.getAllByRole('textbox')[0] as HTMLElement)
      await userEvent.keyboard('482913')
      await expect(args.onValueComplete).toHaveBeenCalledWith('482913', expect.anything())
    })
  },
}
