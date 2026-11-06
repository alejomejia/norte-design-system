import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Badge } from '.'
import { BADGE_TONES } from './badge.const'

const meta = {
  title: 'Elements/Indicators/Badge',
  component: Badge,
  tags: ['beta'],
  argTypes: {
    tone: { control: 'inline-radio', options: BADGE_TONES },
    children: { control: 'text' },
  },
  args: { children: 'Draft' },
  parameters: {
    docs: {
      description: {
        component: 'A short label for a status or a count. Its color repeats what the label says, never replaces it.',
      },
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** One tone per meaning: neutral and accent for labels, the status tones for states. */
export const Tones: Story = {
  parameters: { controls: { exclude: ['tone', 'children'] } },
  render: (args) => (
    <div className="sb-row">
      {BADGE_TONES.map((tone) => (
        <Badge key={tone} {...args} tone={tone}>
          {tone.charAt(0).toUpperCase() + tone.slice(1)}
        </Badge>
      ))}
    </div>
  ),
}

/** A run's states: a dot to read them at a glance, pulsing while the run is still going. */
export const RunStatus: Story = {
  name: 'Run status',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-row">
      <Badge tone="accent" live>
        Running
      </Badge>
      <Badge tone="warning" dot>
        Needs approval
      </Badge>
      <Badge tone="success" dot>
        Finished
      </Badge>
      <Badge tone="danger" dot>
        Failed
      </Badge>
      <Badge dot>Queued</Badge>
    </div>
  ),
}

/** A count next to a label, like the runs waiting in a tab. */
export const Count: Story = { args: { children: '12' } }
