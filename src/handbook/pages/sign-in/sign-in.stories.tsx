import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { SignInPage } from '.'
import { SIGN_IN_COPY } from './sign-in.const'

/** Long enough for the pretend server, the button's check and a step's slide. */
const PATIENCE = { timeout: 4000 }

/** Waits for the step around `element` to finish sliding in: half-faded text fails the contrast check. */
async function settled(element: HTMLElement) {
  const step = element.closest('[data-step]') as HTMLElement
  await waitFor(() => expect(getComputedStyle(step).opacity).toBe('1'), PATIENCE)
}

const meta = {
  title: 'Pages/Workspace/Sign in',
  component: SignInPage,
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
          'Signing in, or up, with a code sent to a work email: no password to forget. The form is Logo, Text field, Code field, Button, Link and Toast; beside it on wide screens, a bento of run #128 (Stat, Card, Message, Plan, Tool call, Run status, Streaming text, Avatar and Badge) over the Introduction\'s map. The server is pretend, and accepts one code: **128 406**.\n\nThe docs\' column shows it at a tablet\'s width. <a href="iframe.html?id=pages-workspace-sign-in--sign-up&viewMode=story" target="_blank" rel="noreferrer">Open the full page in a new tab</a> to see it at your window\'s size, panel included.',
      },
    },
  },
} satisfies Meta<typeof SignInPage>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The page as it opens, on a new account. Run the interactions to go through all of it with the keyboard: the new
 * account's checks, signing in instead with a bad email, the code step, a wrong code, the right one, and back to the
 * start.
 */
export const SignUp: Story = {
  name: 'Sign up',
  args: { defaultMode: 'sign-up' },
  play: async ({ canvas, step }) => {
    await step('A new account asks for a name and an email, and checks both at once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY['sign-up'].submit }))
      await expect(canvas.getByRole('textbox', { name: SIGN_IN_COPY.nameLabel })).toHaveAccessibleDescription(
        SIGN_IN_COPY.nameMissing,
      )
      await expect(canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel })).toHaveAccessibleDescription(
        SIGN_IN_COPY.emailMissing,
      )
    })

    await step('"Sign in" switches to an account that exists, and keeps the email', async () => {
      await userEvent.type(canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel }), 'sofia@norte')
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY['sign-up'].switchAction }))
      await canvas.findByRole('heading', { name: SIGN_IN_COPY['sign-in'].title }, PATIENCE)
      await expect(canvas.queryByRole('textbox', { name: SIGN_IN_COPY.nameLabel })).toBeNull()
      await expect(canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel })).toHaveValue('sofia@norte')
    })

    await step('An incomplete email is caught before anything is sent', async () => {
      const email = canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel })
      await userEvent.click(email)
      await userEvent.keyboard('{Enter}')
      await expect(email).toHaveAttribute('aria-invalid', 'true')
      await expect(email).toHaveAccessibleDescription(SIGN_IN_COPY.emailInvalid)
    })

    await step('Fixing it clears the error, and Enter sends the code', async () => {
      const email = canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel })
      await userEvent.type(email, '.com')
      await expect(email).not.toHaveAttribute('aria-invalid')
      await userEvent.keyboard('{Enter}')
      await expect(canvas.getByRole('button', { name: SIGN_IN_COPY['sign-in'].submit })).toHaveAttribute(
        'aria-busy',
        'true',
      )
    })

    await step('The code step takes over, with focus in its first slot and a countdown for a new code', async () => {
      await canvas.findByRole('heading', { name: SIGN_IN_COPY.codeTitle }, PATIENCE)
      const first = canvas.getAllByRole('textbox')[0] as HTMLElement
      await waitFor(() => expect(first).toHaveFocus(), PATIENCE)
      await expect(canvas.getByRole('group', { name: SIGN_IN_COPY.codeLabel })).toHaveAccessibleDescription(
        /sofia@norte\.com/,
      )
      await expect(canvas.getByText(/Send a new one in 0:\d\d/)).toBeInTheDocument()
      await expect(canvas.queryByRole('button', { name: SIGN_IN_COPY.resend })).toBeNull()
    })

    await step('A toast says the code is on its way, and gives the demo code', async () => {
      const toasts = within(document.body)
      await expect(await toasts.findByText(SIGN_IN_COPY.demoHint)).toBeInTheDocument()
    })

    await step('"Change" goes back to the email, kept, and sending again returns to the code', async () => {
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY.changeEmail }))
      const email = await canvas.findByRole('textbox', { name: SIGN_IN_COPY.emailLabel }, PATIENCE)
      await expect(email).toHaveValue('sofia@norte.com')
      await waitFor(() => expect(email).toHaveFocus(), PATIENCE)
      await userEvent.keyboard('{Enter}')
      await canvas.findByRole('heading', { name: SIGN_IN_COPY.codeTitle }, PATIENCE)
      await waitFor(() => expect(canvas.getAllByRole('textbox')[0]).toHaveFocus(), PATIENCE)
    })

    await step('A wrong code is checked as soon as it is complete, and refused', async () => {
      await userEvent.keyboard('128400')
      const error = await canvas.findByText(SIGN_IN_COPY.codeWrong, {}, PATIENCE)
      await expect(error).toBeInTheDocument()
      for (const slot of canvas.getAllByRole('textbox')) await expect(slot).toHaveAttribute('aria-invalid', 'true')
    })

    await step('Typing the right code over it clears the error and signs in', async () => {
      await userEvent.click(canvas.getAllByRole('textbox')[0] as HTMLElement)
      await userEvent.keyboard('128406')
      for (const slot of canvas.getAllByRole('textbox')) await expect(slot).not.toHaveAttribute('aria-invalid')
      const done = await canvas.findByRole('heading', { name: SIGN_IN_COPY['sign-in'].done }, PATIENCE)
      await waitFor(() => expect(done).toHaveFocus(), PATIENCE)
      await expect(canvas.getByRole('status')).toHaveTextContent(SIGN_IN_COPY.opening)
    })

    await step('"Use another account" starts over on a new account, with focus in the name', async () => {
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY.otherAccount }))
      await canvas.findByRole('heading', { name: SIGN_IN_COPY['sign-up'].title }, PATIENCE)
      const name = canvas.getByRole('textbox', { name: SIGN_IN_COPY.nameLabel })
      await waitFor(() => expect(name).toHaveFocus(), PATIENCE)
      await expect(canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel })).toHaveValue('')
      await settled(name)
    })
  },
}
