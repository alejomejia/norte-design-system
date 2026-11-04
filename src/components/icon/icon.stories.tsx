import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { Button } from '@/components/button'

import { Icon } from '.'
import { ICON_NAMES, ICON_SIZES } from './icon.const'

const meta = {
  title: 'Elements/Media/Icon',
  component: Icon,
  tags: ['beta'],
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: 'inline-radio', options: ICON_SIZES },
    label: { control: 'text' },
  },
  args: { name: 'agent' },
  parameters: {
    docs: {
      description: {
        component:
          "One icon of Norte's set, drawn by Lucide in the color of its text. Every icon, ready to copy, is on [Foundations/Icons](?path=/docs/foundations-icons--docs).",
      },
    },
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** `s` next to interface text, `m` on its own, `l` in empty states. The stroke stays 1.5px at every size. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="sb-row">
      {ICON_SIZES.map((size) => (
        <Icon key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

/** No color of its own: it takes the text's, so it follows a button's states and a message's tone. */
export const Color: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-stack">
      <p className="flex items-center gap-2 text-body-s text-success">
        <Icon name="success" /> Run finished in 42s
      </p>
      <p className="flex items-center gap-2 text-body-s text-warning">
        <Icon name="permission" /> Waiting for your approval
      </p>
      <p className="flex items-center gap-2 text-body-s text-danger">
        <Icon name="error" /> The tool call failed
      </p>
    </div>
  ),
}

/** Inside a button, before or after the label. Decorative there: the label already says what it does. */
export const InAButton: Story = {
  name: 'In a button',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-row">
      <Button>
        <Icon name="run" /> Run agent
      </Button>
      <Button variant="secondary">
        Open logs <Icon name="arrow-right" />
      </Button>
    </div>
  ),
}

/** Alone, with nothing written next to it, an icon needs a `label`: screen readers announce it as an image. */
export const WithLabel: Story = {
  name: 'With a label',
  args: { name: 'pending', label: 'Pending' },
  play: async ({ canvas, step }) => {
    await step('It is announced as an image with its label', async () => {
      await expect(canvas.getByRole('img', { name: 'Pending' })).toBeVisible()
    })
  },
}
