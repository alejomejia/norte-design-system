import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { AVATAR_SIZES } from '@/components/avatar/avatar.const'
import sofiaPhoto from '@/handbook/assets/people/sofia-herrera.jpg'

import { AvatarGroup, type AvatarGroupItem } from '.'

/** The leadership team who'll get the run's summary. */
const RECIPIENTS: AvatarGroupItem[] = [
  { name: 'Sofía Herrera', src: sofiaPhoto },
  { name: 'Daniel Okafor' },
  { name: 'Mei Lin' },
  { name: 'Lucas Moreau' },
  { name: 'Amara Diallo' },
  { name: 'Jonas Berg' },
]

const meta = {
  title: 'Components/Content/Avatar group',
  component: AvatarGroup,
  tags: ['beta'],
  argTypes: {
    max: { control: { type: 'range', min: 1, max: 8 } },
    size: { control: 'inline-radio', options: AVATAR_SIZES },
    avatars: { control: 'object' },
    labels: { table: { disable: true } },
  },
  // The stories show `l`, a step up from the default `m`, like Avatar's.
  args: { avatars: RECIPIENTS, size: 'l' },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A few people at a glance, like the six who get an email: their avatars overlap in a row, and past `max` the last circle counts the rest. Hovering an avatar shows its name, and the "+N" is a button whose tooltip names everyone it stands for. Screen readers hear one group, "6 people", with each visible name and the "+N"\'s list.',
      },
    },
  },
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** Avatar's three sizes. The overlap grows with them, never enough to hide a letter. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="sb-stack">
      {AVATAR_SIZES.map((size) => (
        <AvatarGroup key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

/** When everyone fits within `max`, everyone shows, with no "+N". */
export const FewerThanMax: Story = {
  name: 'Fewer than max',
  args: { avatars: RECIPIENTS.slice(0, 3) },
  play: async ({ canvas, step }) => {
    await step('Every avatar shows, with no "+N"', async () => {
      await expect(canvas.getAllByRole('img')).toHaveLength(3)
      await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
    })
  },
}

/** People and agents together: the agent shows its colors, still in the same row of circles. */
export const WithAnAgent: Story = {
  name: 'With an agent',
  args: {
    avatars: [
      { kind: 'agent', name: 'Research agent', live: true },
      { name: 'Sofía Herrera', src: sofiaPhoto },
      { name: 'Daniel Okafor' },
    ],
  },
}

/** Hover an avatar: its name shows above it, and it rises to the front. */
export const NamesOnHover: Story = {
  name: 'Names on hover',
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement, step }) => {
    await step('Hovering an avatar shows its name', async () => {
      await userEvent.hover(canvas.getByRole('img', { name: 'Daniel Okafor' }))
      const page = within(canvasElement.ownerDocument.body)
      await waitFor(() => expect(page.getByText('Daniel Okafor')).toBeVisible())
    })
  },
}

/**
 * Past `max`, the last circle counts the rest. It's a button, so the keyboard reaches it, and its tooltip names
 * everyone it stands for.
 */
export const More: Story = {
  name: 'The rest',
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement, step }) => {
    await step('The group is named by its size', async () => {
      await expect(canvas.getByRole('group', { name: '6 people' })).toBeInTheDocument()
    })
    await step('Three avatars show, then "+3", named after the rest', async () => {
      await expect(canvas.getAllByRole('img')).toHaveLength(3)
      await expect(
        canvas.getByRole('button', { name: '3 more: Lucas Moreau, Amara Diallo, and Jonas Berg' }),
      ).toHaveTextContent('+3')
    })
    await step('Tabbing to "+3" opens its tooltip with their names', async () => {
      await userEvent.tab()
      const page = within(canvasElement.ownerDocument.body)
      await waitFor(() => expect(page.getByText('Lucas Moreau, Amara Diallo, and Jonas Berg')).toBeVisible())
    })
  },
}
