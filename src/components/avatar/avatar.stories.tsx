import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'

import sofiaPhoto from '@/handbook/assets/people/sofia-herrera.jpg'

import { Avatar } from '.'
import { AVATAR_EFFECTS, AVATAR_KINDS, AVATAR_SIZES, AVATAR_STATUSES } from './avatar.const'

/** Sofía's photo, from Unsplash (credits in `src/handbook/assets/people/README.md`), served by Storybook. */
const SOFIA_PHOTO = sofiaPhoto

const meta = {
  title: 'Elements/Media/Avatar',
  component: Avatar,
  argTypes: {
    kind: { control: 'inline-radio', options: AVATAR_KINDS },
    size: { control: 'inline-radio', options: AVATAR_SIZES },
    effect: { control: 'inline-radio', options: AVATAR_EFFECTS },
    status: { control: 'select', options: [undefined, ...AVATAR_STATUSES] },
    src: { control: 'text' },
    colors: { control: 'object' },
    statusLabels: { control: false },
  },
  // The stories show `l`, a step up from the default `m`, so the details read on the docs page.
  args: { name: 'Sofía Herrera', size: 'l' },
  parameters: {
    docs: {
      description: {
        component:
          'Who someone is, at a glance: a person by their photo or initials, an agent by its own moving colors, with an optional status dot. Set `decorative` when the name is already written next to it.',
      },
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** A person with a photo. It fades in once it has loaded. */
export const WithAPhoto: Story = {
  name: 'With a photo',
  args: { src: SOFIA_PHOTO },
  play: async ({ canvasElement, step }) => {
    await step('The photo shows once it has loaded', async () => {
      await waitFor(() => expect(canvasElement.querySelector('img')).toBeInTheDocument())
    })
  },
}

/** A person without a photo: their initials, on a quiet fill. */
export const Initials: Story = {
  args: { name: 'Daniel Okafor' },
}

/** A photo that fails to load falls back to the initials, so there's never an empty circle or a broken image. */
export const WhenThePhotoFails: Story = {
  name: 'When the photo fails',
  args: { src: '/people/missing-photo.jpg' },
  play: async ({ canvas, step }) => {
    await step('The initials take its place', async () => {
      await waitFor(() => expect(canvas.getByText('SH')).toBeVisible(), { timeout: 3000 })
    })
  },
}

/** An agent at rest: one still frame of its colors. */
export const Agent: Story = {
  args: { kind: 'agent', name: 'Research agent' },
  play: async ({ canvas, step }) => {
    await step('It is one image named after the agent, with its effect inside', async () => {
      const avatar = canvas.getByRole('img', { name: 'Research agent' })
      await expect(avatar.querySelector('canvas')).toBeInTheDocument()
    })
  },
}

/**
 * An agent while it works: its colors move, slowly. It pauses off-screen and in hidden tabs, and holds still for people
 * who asked for less motion.
 */
export const Working: Story = {
  args: { kind: 'agent', name: 'Research agent', live: true, status: 'online' },
}

/**
 * Both effects, working. `orb` swirls like liquid lit as a sphere, and `mesh` blends four drifting points. Each is a
 * shader, and every agent on a page shares one WebGL context.
 */
export const Effects: Story = {
  parameters: { controls: { include: ['size', 'colors'] } },
  render: (args) => (
    <div className="sb-stack">
      <div className="sb-row">
        {AVATAR_EFFECTS.map((effect) => (
          <Avatar
            key={effect}
            kind="agent"
            name={`Research agent (${effect})`}
            size={args.size}
            colors={args.colors}
            effect={effect}
            live
          />
        ))}
      </div>
      {/* Bigger, through `className`, to see each effect's detail. The canvas measures itself, so it stays sharp. */}
      <div className="sb-row">
        {AVATAR_EFFECTS.map((effect) => (
          <Avatar
            key={effect}
            kind="agent"
            name={`Research agent (${effect}), large`}
            colors={args.colors}
            effect={effect}
            live
            className="size-24"
          />
        ))}
      </div>
    </div>
  ),
}

/** Any colors, deep to light: the shadow, the body and the highlight. */
export const CustomColors: Story = {
  name: 'Custom colors',
  args: {
    kind: 'agent',
    name: 'Code agent',
    live: true,
    colors: ['oklch(0.42 0.19 300)', 'oklch(0.62 0.2 330)', 'oklch(0.8 0.12 20)'],
  },
}

/** `s` in dense rows, `m` in messages and cards, `l` in the sidebar's footer. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="sb-stack">
      <div className="sb-row">
        {AVATAR_SIZES.map((size) => (
          <Avatar key={size} name="Sofía Herrera" src={SOFIA_PHOTO} size={size} />
        ))}
      </div>
      <div className="sb-row">
        {AVATAR_SIZES.map((size) => (
          <Avatar key={size} name="Mei Lin" size={size} />
        ))}
      </div>
      <div className="sb-row">
        {AVATAR_SIZES.map((size) => (
          <Avatar key={size} kind="agent" name="Research agent" size={size} />
        ))}
      </div>
    </div>
  ),
}

/** Whether they're around. The dot's color repeats what screen readers hear after the name. */
export const Statuses: Story = {
  parameters: { controls: { exclude: ['status', 'name'] } },
  render: (args) => (
    <div className="sb-row">
      <Avatar {...args} name="Sofía Herrera" status="online" />
      <Avatar {...args} name="Lucas Moreau" status="away" />
      <Avatar {...args} name="Amara Diallo" status="busy" />
      <Avatar {...args} name="Jonas Berg" status="offline" />
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('Each status is part of the name screen readers hear', async () => {
      await expect(canvas.getByRole('img', { name: 'Sofía Herrera, Online' })).toBeInTheDocument()
      await expect(canvas.getByRole('img', { name: 'Jonas Berg, Offline' })).toBeInTheDocument()
    })
  },
}

/** Next to a written name, the avatar is decorative: screen readers hear the name once, from the text. */
export const NextToAName: Story = {
  name: 'Next to a name',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar kind="agent" name="Research agent" decorative />
      <span className="flex flex-col">
        <span className="text-body-s font-medium text-ink">Research agent</span>
        <span className="text-caption text-ink-subtle">Run #128 · 4m 12s</span>
      </span>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('The avatar is hidden, so the name is heard once', async () => {
      await expect(canvas.queryByRole('img')).not.toBeInTheDocument()
      await expect(canvas.getByText('Research agent')).toBeVisible()
    })
  },
}
