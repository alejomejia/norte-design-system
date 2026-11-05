import { type Meta, type StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, waitFor } from 'storybook/test'

import { Button } from '.'
import { BUTTON_HOVERS, BUTTON_SIZES, BUTTON_VARIANTS } from './button.const'

const meta = {
  title: 'Elements/Actions/Button',
  component: Button,
  tags: ['beta'],
  argTypes: {
    variant: { control: 'inline-radio', options: BUTTON_VARIANTS },
    size: { control: 'inline-radio', options: BUTTON_SIZES },
    hover: { control: 'inline-radio', options: BUTTON_HOVERS },
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
          "Starts an action. `primary` for the main one on a screen, `secondary` beside it, `ghost` for quiet ones in toolbars and lists, and `danger` for what can't be undone. While its action runs, it keeps its width and shows a spinner, and when the action succeeds the spinner can turn into a check.",
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
 * Hover each row: `wipe` sweeps the fill across, for the action you want noticed; `fade` brings it in quietly, for
 * buttons that sit in a row, where a sweep on each would be too much.
 */
export const Hovers: Story = {
  parameters: { controls: { exclude: ['hover', 'variant', 'children'] } },
  render: (args) => (
    <div className="sb-stack">
      {BUTTON_HOVERS.map((hover) => (
        <div key={hover} className="sb-row">
          <Button {...args} hover={hover} variant="secondary">
            Edit instructions
          </Button>
          <Button {...args} hover={hover} variant="ghost">
            View logs
          </Button>
          <Button {...args} hover={hover} variant="ghost">
            Share
          </Button>
        </div>
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

/** How long the example action takes, in ms. */
const RUN_DURATION = 1500

/**
 * When the action succeeds, the spinner turns into a check that draws itself, and the label comes back a moment later.
 * Set `success` as `loading` turns off; the next click clears it. Screen readers hear "Done" (`successLabel`). Click it.
 */
export const Success: Story = {
  name: 'Loading, then success',
  parameters: { controls: { exclude: ['loading', 'success'] } },
  render: function Render(args) {
    const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')

    async function run(event: Parameters<NonNullable<typeof args.onClick>>[0]) {
      args.onClick?.(event)
      setStatus('running')
      await new Promise((resolve) => setTimeout(resolve, RUN_DURATION))
      setStatus('done')
    }

    return <Button {...args} loading={status === 'running'} success={status === 'done'} onClick={run} />
  },
  play: async ({ canvas, step, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Run agent' })

    await step('It shows a spinner while the action runs', async () => {
      await userEvent.click(button)
      await expect(button).toHaveAttribute('aria-busy', 'true')
    })
    await step('It announces the success', async () => {
      await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Done'), { timeout: RUN_DURATION * 2 })
      await expect(button).not.toHaveAttribute('aria-busy')
    })
    await step('Its label comes back', async () => {
      await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent(''), { timeout: 3000 })
      await expect(button).not.toHaveAttribute('data-disabled')
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
