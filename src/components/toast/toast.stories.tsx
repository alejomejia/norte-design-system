import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/button'

import { ToastProvider, useToast } from '.'

/** Buttons that add toasts, standing in for an app. */
function Demo() {
  const toast = useToast()

  function runAgent() {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2200)), {
      loading: { title: 'Research agent is running', description: 'Visiting pricing pages…' },
      success: { title: 'Run finished', description: 'The pricing summary is ready.' },
      error: { title: 'Run failed', description: 'A pricing page timed out.' },
    })
  }

  return (
    <div className="sb-row">
      <Button onClick={runAgent}>Run agent</Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            title: 'Instructions saved',
            description: 'The agent uses them from its next run.',
            type: 'success',
          })
        }
      >
        Save instructions
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            title: 'Approval needed',
            description: 'The research agent wants to send 3 emails.',
            type: 'warning',
            actionProps: { children: 'Review' },
          })
        }
      >
        Ask for approval
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          toast.add({ title: 'Agent deleted', description: 'Its runs are kept for 30 days.', type: 'error' })
        }
      >
        Delete agent
      </Button>
    </div>
  )
}

const meta = {
  title: 'Components/Feedback/Toast',
  component: ToastProvider,
  tags: ['beta'],
  argTypes: {
    limit: { control: { type: 'range', min: 1, max: 5 } },
    timeout: { control: { type: 'range', min: 2000, max: 10_000 } },
    children: { table: { disable: true } },
  },
  args: { children: null },
  render: (args) => (
    <ToastProvider {...args}>
      <Demo />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Brief messages about something that just happened, stacked in a corner like Sonner's and leaving on their own. Wrap the app in `ToastProvider` once, then add toasts with `useToast()`.",
      },
    },
  },
} satisfies Meta<typeof ToastProvider>

export default meta
type Story = StoryObj<typeof meta>

/** Click the buttons, several times: watch the stack grow, then hover it to fan it out. */
export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: 'shown' } } },
}

/** A toast that follows an async action: loading while it runs, then its outcome, in place. */
export const FollowingARun: Story = {
  name: 'Following a run',
  play: async ({ canvas, canvasElement, step }) => {
    const page = within(canvasElement.ownerDocument.body)

    await step('It shows the loading toast while the run works', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Run agent' }))
      await expect(await page.findByText('Research agent is running')).toBeVisible()
    })
    await step('Then the outcome replaces it', async () => {
      await waitFor(() => expect(page.getByText('Run finished')).toBeVisible(), { timeout: 4000 })
    })
  },
}
