import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { KeyboardKey } from '.'

const meta = {
  title: 'Elements/Indicators/Keyboard key',
  component: KeyboardKey,
  tags: ['beta'],
  argTypes: { children: { control: 'text' } },
  args: { children: 'K' },
  parameters: {
    docs: {
      description: {
        component:
          'A key or a shortcut, like ⌘K, written the way it looks on a keyboard: one cap, its keys side by side. Pass a shortcut as `keys`, a single key as `children`.',
      },
    },
  },
} satisfies Meta<typeof KeyboardKey>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/**
 * A shortcut: its `keys` in one cap, side by side, like `⌘K`. Symbols are read by name, so screen readers say "Command
 * K", not "⌘ K".
 */
export const Shortcut: Story = {
  args: { keys: ['⌘', 'K'], children: undefined },
  play: async ({ canvas, step }) => {
    await step('Screen readers hear the keys by name', async () => {
      await expect(canvas.getByText('K').closest('kbd')?.parentElement).toHaveTextContent('Command K')
    })
  },
}

/** Common shortcuts in Norte. */
export const Shortcuts: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-row">
      <KeyboardKey keys={['⌘', 'K']} />
      <KeyboardKey keys={['⌘', '↵']} />
      <KeyboardKey keys={['⇧', '↵']} />
      <KeyboardKey keys={['⌘', '⇧', 'P']} />
      <KeyboardKey>Esc</KeyboardKey>
    </div>
  ),
}

/** Inside a sentence, as a hint. */
export const InText: Story = {
  name: 'In text',
  parameters: { controls: { disable: true } },
  render: () => (
    <p className="text-body-s text-ink-muted">
      Press <KeyboardKey keys={['↵']} /> to send, or <KeyboardKey keys={['⇧', '↵']} /> for a new line.
    </p>
  ),
}
