import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { SignInPage } from '.'
import { SIGN_IN_COPY, SIGN_IN_MODES, SIGN_IN_STEPS } from './sign-in.const'

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
  argTypes: {
    defaultMode: { control: 'inline-radio', options: SIGN_IN_MODES },
    defaultStep: { control: 'inline-radio', options: SIGN_IN_STEPS },
  },
  parameters: {
    layout: 'fullscreen',
    // Each story is a whole page: on the docs page it gets a window of its own, a laptop's height.
    docs: {
      story: { inline: false, iframeHeight: 760 },
      description: {
        component:
          "Signing in, or up, with a code sent to a work email: no password to forget. Built only from Norte's components: Logo, Text field, Code field, Button, Link and Toast for the form, and Message, Plan, Tool call, Run status and Streaming text playing run #128 in the panel beside it on wide screens. The server is pretend, and accepts one code: **128 406**.",
      },
    },
  },
} satisfies Meta<typeof SignInPage>

export default meta
type Story = StoryObj<typeof meta>

/** An email, a code, and in. Run the interactions to go through it with the keyboard: a bad email, a wrong code, the right one. */
export const SignIn: Story = {
  name: 'Sign in',
  play: async ({ canvas, step }) => {
    const email = canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel })

    await step('An incomplete email is caught before anything is sent', async () => {
      await userEvent.type(email, 'sofia@norte')
      await userEvent.keyboard('{Enter}')
      await expect(email).toHaveAttribute('aria-invalid', 'true')
      await expect(email).toHaveAccessibleDescription(SIGN_IN_COPY.emailInvalid)
    })

    await step('Fixing it clears the error, and Enter sends the code', async () => {
      await userEvent.type(email, '.com')
      await expect(email).not.toHaveAttribute('aria-invalid')
      await userEvent.keyboard('{Enter}')
      await expect(canvas.getByRole('button', { name: SIGN_IN_COPY['sign-in'].submit })).toHaveAttribute(
        'aria-busy',
        'true',
      )
    })

    await step('The code step takes over, with focus in its first slot', async () => {
      await canvas.findByRole('heading', { name: SIGN_IN_COPY.codeTitle }, PATIENCE)
      const first = canvas.getAllByRole('textbox')[0] as HTMLElement
      await waitFor(() => expect(first).toHaveFocus(), PATIENCE)
      await expect(canvas.getByRole('group', { name: SIGN_IN_COPY.codeLabel })).toHaveAccessibleDescription(
        /sofia@norte\.com/,
      )
    })

    await step('A toast says the code is on its way, and gives the demo code', async () => {
      const toasts = within(document.body)
      await expect(await toasts.findByText(SIGN_IN_COPY.demoHint)).toBeInTheDocument()
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

    await step('"Use another account" starts over, with focus in the email', async () => {
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY.otherAccount }))
      const fresh = await canvas.findByRole('textbox', { name: SIGN_IN_COPY.emailLabel }, PATIENCE)
      await waitFor(() => expect(fresh).toHaveFocus(), PATIENCE)
      await expect(fresh).toHaveValue('')
      await settled(fresh)
    })
  },
}

/** A new account asks for a name too, and the terms it agrees to. */
export const SignUp: Story = {
  name: 'Sign up',
  args: { defaultMode: 'sign-up' },
  play: async ({ canvas, step }) => {
    await step('Both fields are checked at once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY['sign-up'].submit }))
      await expect(canvas.getByRole('textbox', { name: SIGN_IN_COPY.nameLabel })).toHaveAccessibleDescription(
        SIGN_IN_COPY.nameMissing,
      )
      await expect(canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel })).toHaveAccessibleDescription(
        SIGN_IN_COPY.emailMissing,
      )
    })

    await step('"Sign in" switches the form, and keeps the email', async () => {
      await userEvent.type(canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel }), 'sofia@norte.com')
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY['sign-up'].switchAction }))
      await canvas.findByRole('heading', { name: SIGN_IN_COPY['sign-in'].title }, PATIENCE)
      await expect(canvas.queryByRole('textbox', { name: SIGN_IN_COPY.nameLabel })).toBeNull()
      await expect(canvas.getByRole('textbox', { name: SIGN_IN_COPY.emailLabel })).toHaveValue('sofia@norte.com')
    })

    await step('"Create an account" switches back', async () => {
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY['sign-in'].switchAction }))
      await settled(await canvas.findByRole('heading', { name: SIGN_IN_COPY['sign-up'].title }, PATIENCE))
    })
  },
}

/** The code step: six slots, a way back to the email, and a new code after 30 seconds. */
export const Code: Story = {
  args: { defaultStep: 'code', defaultEmail: 'sofia@norte.com' },
  play: async ({ canvas, step }) => {
    await step('A new code waits for the countdown', async () => {
      await expect(canvas.getByText(/Send a new one in 0:\d\d/)).toBeInTheDocument()
      await expect(canvas.queryByRole('button', { name: SIGN_IN_COPY.resend })).toBeNull()
    })

    await step('"Change" goes back to the email, kept', async () => {
      await userEvent.click(canvas.getByRole('button', { name: SIGN_IN_COPY.changeEmail }))
      const email = await canvas.findByRole('textbox', { name: SIGN_IN_COPY.emailLabel }, PATIENCE)
      await expect(email).toHaveValue('sofia@norte.com')
      await waitFor(() => expect(email).toHaveFocus(), PATIENCE)
      await settled(email)
    })
  },
}

/** The way in for a new account ends with a welcome by name. */
export const SignedUp: Story = {
  name: 'Signed up',
  args: { defaultMode: 'sign-up', defaultStep: 'done', defaultName: 'Sofía Herrera', defaultEmail: 'sofia@norte.com' },
}

/** On a phone the panel steps aside and the form takes the screen; the code's slots narrow to fit 320px. */
export const Phone: Story = {
  args: { defaultStep: 'code', defaultEmail: 'sofia@norte.com' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** On a tablet, the form alone, in the middle of the screen. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
}
