import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'

import { Button } from '.'
import { BUTTON_SIZES, BUTTON_VARIANTS } from './button.const'

const meta = {
  title: 'Elements/Actions/Button',
  component: Button,
  tags: ['beta'],
  argTypes: {
    variant: { control: 'inline-radio', options: BUTTON_VARIANTS },
    size: { control: 'inline-radio', options: BUTTON_SIZES },
    children: { control: 'text' },
    // Base UI's escape hatches. `render` gets its docs with Link, the element it's for.
    render: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  args: { children: 'Run agent', onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Starts an action. `primary` for the main one on a screen, `secondary` beside it, `ghost` for quiet ones in toolbars and lists, and `danger` for what can't be undone. While its action runs, it keeps its width and shows a spinner.",
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** The main action of a screen, like starting a run. One per view. */
export const Primary: Story = {}

/** Actions next to the primary one, like "Cancel" or "Edit". */
export const Secondary: Story = { args: { variant: 'secondary', children: 'Edit instructions' } }

/** Quiet actions that repeat in toolbars, lists and cards. */
export const Ghost: Story = { args: { variant: 'ghost', children: 'View logs' } }

/** Actions that can't be undone, like deleting an agent. Red only says so: pair it with a confirmation. */
export const Danger: Story = { args: { variant: 'danger', children: 'Delete agent' } }

/** `m` everywhere, `s` in toolbars and dense rows. */
export const Sizes: Story = {
  // Each button sets its own size: the other controls still apply to both.
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="sb-row">
      <Button {...args} size="s" />
      <Button {...args} />
    </div>
  ),
}

/** Every variant side by side, to compare their weight. */
export const Variants: Story = {
  // Each button sets its own variant and label: the other controls still apply to all of them.
  parameters: { controls: { exclude: ['variant', 'children'] } },
  render: (args) => (
    <div className="sb-row">
      {BUTTON_VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant.charAt(0).toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
}

/**
 * While its action runs: a spinner in place of the label, the same width, and no second click. It stays focusable and
 * keeps its name, so a screen reader hears "Run agent, busy".
 */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ args, canvas, step, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Run agent' })

    await step('It announces itself as busy', async () => {
      await expect(button).toHaveAttribute('aria-busy', 'true')
    })
    await step('It ignores clicks', async () => {
      await userEvent.click(button)
      await expect(args.onClick).not.toHaveBeenCalled()
    })
    await step('It keeps focus', async () => {
      button.focus()
      await expect(button).toHaveFocus()
    })
  },
}

/** Ignores clicks and dims. Prefer explaining why an action isn't available over disabling it. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, step, userEvent }) => {
    await step('It ignores clicks', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Run agent' }))
      await expect(args.onClick).not.toHaveBeenCalled()
    })
  },
}

const submitForm = fn()

/** Inside a form, a button never submits it unless it says so with `type="submit"`. */
export const InAForm: Story = {
  name: 'In a form',
  // A behavior, checked by its play function: no controls.
  parameters: { controls: { disable: true } },
  render: (args) => (
    <form
      className="sb-row"
      onSubmit={(event) => {
        event.preventDefault()
        submitForm()
      }}
    >
      <Button {...args} variant="secondary">
        Save draft
      </Button>
      <Button {...args} type="submit">
        Start run
      </Button>
    </form>
  ),
  play: async ({ canvas, step, userEvent }) => {
    submitForm.mockClear()
    await step('A button without a type does not submit the form', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Save draft' }))
      await expect(submitForm).not.toHaveBeenCalled()
    })
    await step('The submit button does', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Start run' }))
      await expect(submitForm).toHaveBeenCalledOnce()
    })
  },
}
