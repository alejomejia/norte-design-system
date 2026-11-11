import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { RunViewPage } from '.'
import { RUN_VIEW_COPY, RUN_VIEW_REPLIES } from './run-view.const'

/** Long enough for the opening to replay and the summary to finish writing, a pretend server, and an answer to stream. */
const PATIENCE = { timeout: 8000 }

/** Long enough for Undo action's five seconds to run out. */
const UNDO_PATIENCE = { timeout: 9000 }

const meta = {
  title: 'Pages/Workspace/Run view',
  component: RunViewPage,
  parameters: {
    layout: 'fullscreen',
    // A page has nothing to set: its states are reached by using it. No Controls panel, and no props table.
    controls: { disable: true },
    // A whole page: on the docs page it gets a window of its own, a laptop's height (as wide as the docs' column, so
    // narrower than a laptop: the full page is a link away).
    docs: {
      story: { inline: false, iframeHeight: 760 },
      description: {
        component:
          'Run #128 as Sofía sees it: her ask arrives, the Research agent thinks, then finishes its summary of five competitors\' pricing, then waits for her to approve the email to the leadership team. Every piece is Norte\'s: Sidebar, Breadcrumb, Run status, Message, Plan, Reasoning, Tool call, Alert, Streaming text, Citation, Source list, Approval request, Suggestions and Prompt input; beside them, Tabs with a Data table, Stats, two charts, an Accordion of settings and an Empty state. Share, the ⋯ menu and ⌘K all work, and the follow-ups get answers.\n\nThe docs\' column shows it at a tablet\'s width. <a href="iframe.html?id=pages-workspace-run-view--waiting-for-approval&viewMode=story" target="_blank" rel="noreferrer">Open the full page in a new tab</a> to see it at your window\'s size, sidebar and panel beside the conversation.',
      },
    },
  },
} satisfies Meta<typeof RunViewPage>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The page as it opens: Sofía's ask arrives, the agent thinks, then writes the last of its summary, while the results
 * load. Run the interactions to go through all of it: the results and a question about two of them, a follow-up, the approval (undone once, then sent),
 * Share, deleting from the ⋯ menu, ⌘K to the details and their cost, the settings and the logs.
 */
export const WaitingForApproval: Story = {
  name: 'Waiting for approval',
  play: async ({ canvas, canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body)
    const prompt = canvas.getByRole('textbox', { name: 'Prompt' })

    await step('One heading names the page; the breadcrumb, the conversation and the panel are landmarks', async () => {
      await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(RUN_VIEW_COPY.title)
      await expect(
        within(canvas.getByRole('navigation', { name: 'Breadcrumb' })).getByText('Run #128'),
      ).toHaveAttribute('aria-current', 'page')
      await expect(canvas.getByRole('main')).toBeInTheDocument()
      await expect(canvas.getByRole('complementary', { name: RUN_VIEW_COPY.panel })).toBeInTheDocument()
    })

    await step("The thread replays as it opens: Sofía's ask, then the agent thinking about it", async () => {
      const thread = within(canvas.getByRole('main'))
      await thread.findByText(RUN_VIEW_COPY.ask, {}, PATIENCE)
      await thread.findAllByText('Thinking', {}, PATIENCE)
    })

    await step('The results load behind skeletons, then show each change with its source', async () => {
      const table = canvas.getByRole('table', { name: RUN_VIEW_COPY.resultsCaption })
      await waitFor(() => expect(within(table).getAllByRole('rowheader')).toHaveLength(5), PATIENCE)
      const fieldnote = within(table).getByRole('rowheader', { name: 'Fieldnote' }).closest('tr') as HTMLElement
      await expect(within(fieldnote).getByText(RUN_VIEW_COPY.up(2))).toBeInTheDocument()
      await expect(within(fieldnote).getByRole('link', { name: /^Source 1: Fieldnote pricing/ })).toBeInTheDocument()
      const orbit = within(table).getByRole('rowheader', { name: 'Orbit' }).closest('tr') as HTMLElement
      await expect(within(orbit).getByText(RUN_VIEW_COPY.unreadable)).toBeInTheDocument()
    })

    await step('Once the summary is written, the run asks to send it, and waits', async () => {
      const approval = await canvas.findByRole('article', { name: RUN_VIEW_COPY.approvalTitle }, PATIENCE)
      await expect(within(approval).getByRole('button', { name: 'Approve' })).toBeEnabled()
      await expect(canvas.getAllByRole('status')[0]).toHaveTextContent(RUN_VIEW_COPY.runDetail.waiting)
      await expect(
        within(canvas.getByRole('main')).getByRole('link', { name: /^Source 4: Kitewise pricing/ }),
      ).toBeInTheDocument()
    })

    await step('Selecting two competitors offers to ask about them, in the prompt', async () => {
      const table = canvas.getByRole('table', { name: RUN_VIEW_COPY.resultsCaption })
      const rows = ['Fieldnote', 'Tandem'].map(
        (name) => within(table).getByRole('rowheader', { name }).closest('tr') as HTMLElement,
      )
      for (const row of rows) await userEvent.click(within(row).getByRole('checkbox'))
      await expect(canvas.getByText(RUN_VIEW_COPY.selected(2))).toBeInTheDocument()
      await userEvent.click(canvas.getByRole('button', { name: RUN_VIEW_COPY.askAbout }))
      await expect(prompt).toHaveValue(RUN_VIEW_COPY.askAboutPrompt(['Fieldnote', 'Tandem']))
      await expect(prompt).toHaveFocus()
      for (const row of rows) await userEvent.click(within(row).getByRole('checkbox'))
      await expect(canvas.getByText(RUN_VIEW_COPY.resultsNote)).toBeInTheDocument()
    })

    await step('A suggestion writes its prompt; Enter sends it, and the agent answers', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Add annual prices' }))
      await expect(prompt).toHaveValue('Add annual prices')
      await expect(prompt).toHaveFocus()
      await userEvent.keyboard('{Enter}')
      await expect(prompt).toHaveValue('')
      await expect(await canvas.findByRole('button', { name: 'Stop the run' })).toBeInTheDocument()
      const answer = RUN_VIEW_REPLIES['Add annual prices']?.split(' [')[0] ?? ''
      await canvas.findByText(new RegExp(`^${answer.slice(0, 24)}`), {}, PATIENCE)
      await waitFor(() => expect(canvas.queryByRole('button', { name: 'Stop the run' })).toBeNull(), PATIENCE)
    })

    await step('Approve can be undone; left alone, the email goes, and the run is done', async () => {
      const approval = canvas.getByRole('article', { name: RUN_VIEW_COPY.approvalTitle })
      await userEvent.click(within(approval).getByRole('button', { name: 'Approve' }))
      await userEvent.click(await within(approval).findByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(within(approval).getByRole('button', { name: 'Approve' })).toHaveFocus())
      await userEvent.click(within(approval).getByRole('button', { name: 'Approve' }))
      await body.findByText(RUN_VIEW_COPY.sentNote, {}, UNDO_PATIENCE)
      await expect(canvas.getAllByRole('status')[0]).toHaveTextContent(RUN_VIEW_COPY.runDetail.approved)
    })

    await step('Share opens a dialog that checks the email before it invites', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^Share( run)?$/ }))
      const dialog = await body.findByRole('dialog', { name: RUN_VIEW_COPY.shareTitle })
      const email = within(dialog).getByRole('textbox', { name: RUN_VIEW_COPY.inviteLabel })
      await waitFor(() => expect(email).toHaveFocus())
      await userEvent.keyboard('{Enter}')
      await expect(email).toHaveAccessibleDescription(RUN_VIEW_COPY.inviteMissing)
      await userEvent.type(email, 'daniel@norte.com{Enter}')
      await within(dialog).findByText('daniel@norte.com', {}, PATIENCE)
      await expect(email).toHaveValue('')
      await userEvent.keyboard('{Escape}')
      await waitFor(() => expect(body.queryByRole('dialog', { name: RUN_VIEW_COPY.shareTitle })).toBeNull())
    })

    await step("The ⋯ menu's Delete asks first; Cancel keeps the run, Delete removes it", async () => {
      const actions = canvas.getByRole('button', { name: RUN_VIEW_COPY.runActions })
      await userEvent.click(actions)
      await userEvent.click(await body.findByRole('menuitem', { name: RUN_VIEW_COPY.deleteRun }))
      const confirm = await body.findByRole('alertdialog', { name: RUN_VIEW_COPY.deleteTitle })
      await userEvent.click(within(confirm).getByRole('button', { name: RUN_VIEW_COPY.cancel }))
      await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull())
      await userEvent.click(actions)
      await userEvent.click(await body.findByRole('menuitem', { name: RUN_VIEW_COPY.deleteRun }))
      const again = await body.findByRole('alertdialog', { name: RUN_VIEW_COPY.deleteTitle })
      await userEvent.click(within(again).getByRole('button', { name: RUN_VIEW_COPY.deleteRun }))
      await body.findByText(RUN_VIEW_COPY.deletedNote, {}, PATIENCE)
      await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull())
    })

    await step('Search finds "Show details", which opens the Details tab', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^Search/ }))
      const search = await body.findByRole('combobox', { name: 'Command menu' })
      await waitFor(() => expect(search).toHaveFocus())
      await userEvent.type(search, 'details')
      await userEvent.keyboard('{ArrowDown}{Enter}')
      await waitFor(() =>
        expect(canvas.getByRole('tab', { name: RUN_VIEW_COPY.tabs.details })).toHaveAttribute('aria-selected', 'true'),
      )
    })

    await step('The cost explains itself in a popover; the email added a tool call', async () => {
      await userEvent.click(canvas.getByRole('button', { name: RUN_VIEW_COPY.costTitle }))
      await expect(await body.findByRole('dialog', { name: RUN_VIEW_COPY.costTitle })).toHaveAccessibleDescription(
        RUN_VIEW_COPY.costLead,
      )
      await userEvent.keyboard('{Escape}')
      await expect(canvas.getByText('24')).toBeInTheDocument()
    })

    await step('Keeping logs is one switch, in the settings and in the Logs tab', async () => {
      await userEvent.click(canvas.getByRole('button', { name: new RegExp(RUN_VIEW_COPY.settings.permissions) }))
      await userEvent.click(await canvas.findByRole('switch', { name: RUN_VIEW_COPY.keepLogs }))
      await userEvent.click(canvas.getByRole('tab', { name: RUN_VIEW_COPY.tabs.logs }))
      await expect(await canvas.findByRole('heading', { name: RUN_VIEW_COPY.logsOnTitle })).toBeInTheDocument()
      await userEvent.click(canvas.getByRole('button', { name: RUN_VIEW_COPY.turnOffLogs }))
      await expect(canvas.getByRole('heading', { name: RUN_VIEW_COPY.logsOffTitle })).toBeInTheDocument()
    })

    await step('Back to the results, where the page started', async () => {
      await userEvent.click(canvas.getByRole('tab', { name: /^Results/ }))
      // The panel fades in: half-faded text would fail the contrast check that runs after the play test.
      await waitFor(() => expect(canvas.getByRole('table', { name: RUN_VIEW_COPY.resultsCaption })).toBeVisible())
      const panel = canvas.getByRole('tabpanel')
      await waitFor(() => expect(getComputedStyle(panel).opacity).toBe('1'))
    })
  },
}
