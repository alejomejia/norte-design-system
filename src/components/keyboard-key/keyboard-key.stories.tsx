import { type Meta, type StoryObj } from '@storybook/react-vite'

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
        component: 'A key or a shortcut, like ⌘K, written the way it looks on a keyboard.',
      },
    },
  },
} satisfies Meta<typeof KeyboardKey>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** A shortcut: its keys side by side. Symbols get a `label`, so screen readers say "Command K", not "⌘ K". */
export const Shortcut: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-row">
      <span className="inline-flex gap-1">
        <KeyboardKey label="Command">⌘</KeyboardKey>
        <KeyboardKey>K</KeyboardKey>
      </span>
      <span className="inline-flex gap-1">
        <KeyboardKey label="Shift">⇧</KeyboardKey>
        <KeyboardKey>Enter</KeyboardKey>
      </span>
    </div>
  ),
}

/** Inside a sentence, as a hint. */
export const InText: Story = {
  name: 'In text',
  parameters: { controls: { disable: true } },
  render: () => (
    <p className="text-body-s text-ink-muted">
      Press <KeyboardKey>Enter</KeyboardKey> to send, or <KeyboardKey label="Shift">⇧</KeyboardKey>{' '}
      <KeyboardKey>Enter</KeyboardKey> for a new line.
    </p>
  ),
}
