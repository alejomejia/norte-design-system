'use client'

import { type FormEvent, useId, useRef } from 'react'

import { Button } from '@/components/button'
import { CodeField } from '@/components/code-field'
import { Link } from '@/components/link'
import { Spinner } from '@/components/spinner'
import { TextField } from '@/components/text-field'
import { cn, toCSSVars } from '@/lib/utils'

import { SIGN_IN_COPY, SIGN_IN_DEMO_CODE, SIGN_IN_STAGGER } from './sign-in.const'
import { useStepFocus } from './sign-in.hooks'
import { signInStepStyles, signInStyles } from './sign-in.styles'
import { type SignInMode } from './sign-in.types'

const styles = signInStepStyles()

/** What every step knows: whether a person moved to it (focus goes in), and whether it's the one the page opened on. */
type StepBaseProps = {
  /** A person moved here from another step: its first field takes focus. */
  moved: boolean
  /** The page opened on this step: its rows rise in one after another. */
  opening: boolean
}

/** A row's class and `style`: on the step the page opened on, it rises in after the rows before it. */
function rise(opening: boolean, index: number, className: string) {
  if (!opening) return { className }
  return {
    className: cn(className, signInStyles().rise()),
    style: toCSSVars({ 'rise-delay': `${index * SIGN_IN_STAGGER}ms` }),
  }
}

export type SignInDetailsStepProps = StepBaseProps & {
  mode: SignInMode
  name: string
  email: string
  nameError?: string
  emailError?: string
  /** The code is on its way: the button spins. */
  sending: boolean
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onSubmit: () => void
  onSwitchMode: () => void
}

/** The first step: a work email (and a name, for a new account) to send a code to. */
export function SignInDetailsStep({
  mode,
  name,
  email,
  nameError,
  emailError,
  sending,
  moved,
  opening,
  onNameChange,
  onEmailChange,
  onSubmit,
  onSwitchMode,
}: SignInDetailsStepProps) {
  const ref = useRef<HTMLDivElement>(null)
  useStepFocus(ref, moved)
  const copy = SIGN_IN_COPY[mode]

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div ref={ref} className={styles.root()}>
      <div {...rise(opening, 0, styles.intro())}>
        <h1 className={styles.title()}>{copy.title}</h1>
        <p className={styles.lead()}>{copy.lead}</p>
      </div>
      {/* The page checks the fields itself, so the browser's bubbles don't cover its messages. */}
      <form noValidate onSubmit={submit} {...rise(opening, 1, styles.form())}>
        {mode === 'sign-up' && (
          <TextField
            label={SIGN_IN_COPY.nameLabel}
            placeholder={SIGN_IN_COPY.namePlaceholder}
            autoComplete="name"
            value={name}
            onValueChange={onNameChange}
            error={nameError}
          />
        )}
        <TextField
          label={SIGN_IN_COPY.emailLabel}
          placeholder={SIGN_IN_COPY.emailPlaceholder}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onValueChange={onEmailChange}
          error={emailError}
        />
        <Button type="submit" loading={sending} className={styles.submit()}>
          {copy.submit}
        </Button>
        {mode === 'sign-up' && (
          <p className={styles.fine()}>
            {SIGN_IN_COPY.terms} <Link href="#terms">{SIGN_IN_COPY.termsLink}</Link> and{' '}
            <Link href="#privacy">{SIGN_IN_COPY.privacyLink}</Link>.
          </p>
        )}
      </form>
      <p {...rise(opening, 2, styles.note())}>
        {copy.switchPrompt}{' '}
        <Link render={<button type="button" />} onClick={onSwitchMode}>
          {copy.switchAction}
        </Link>
      </p>
    </div>
  )
}

export type SignInCodeStepProps = StepBaseProps & {
  email: string
  code: string
  error?: string
  /** The code is being checked: the slots hold still and the button spins. */
  verifying: boolean
  /** The code was right: the button shows its check. */
  verified: boolean
  /** Seconds before a new code can be sent. */
  resendIn: number
  onCodeChange: (code: string) => void
  onSubmit: (code: string) => void
  onChangeEmail: () => void
  onResend: () => void
}

/** The second step: the code from the email. It's checked as soon as the last digit is in, or on Verify. */
export function SignInCodeStep({
  email,
  code,
  error,
  verifying,
  verified,
  resendIn,
  moved,
  opening,
  onCodeChange,
  onSubmit,
  onChangeEmail,
  onResend,
}: SignInCodeStepProps) {
  const ref = useRef<HTMLDivElement>(null)
  const leadId = useId()
  useStepFocus(ref, moved)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(code)
  }

  return (
    <div ref={ref} className={styles.root()}>
      <div {...rise(opening, 0, styles.intro())}>
        <h1 className={styles.title()}>{SIGN_IN_COPY.codeTitle}</h1>
        <p id={leadId} className={styles.lead()}>
          {SIGN_IN_COPY.codeSentTo} <span className={styles.email()}>{email}</span>. {SIGN_IN_COPY.codeExpires}{' '}
          <Link render={<button type="button" />} onClick={onChangeEmail}>
            {SIGN_IN_COPY.changeEmail}
          </Link>
        </p>
      </div>
      <form noValidate onSubmit={submit} {...rise(opening, 1, styles.form())}>
        <CodeField
          label={SIGN_IN_COPY.codeLabel}
          length={SIGN_IN_DEMO_CODE.length}
          value={code}
          onValueChange={onCodeChange}
          readOnly={verifying || verified}
          error={error}
          aria-describedby={leadId}
        />
        <Button
          type="submit"
          loading={verifying}
          success={verified}
          successLabel={SIGN_IN_COPY.verified}
          className={styles.submit()}
        >
          {SIGN_IN_COPY.verify}
        </Button>
      </form>
      <p {...rise(opening, 2, styles.note())}>
        {SIGN_IN_COPY.resendPrompt}{' '}
        {resendIn > 0 ? (
          <span className="tabular-nums">
            {SIGN_IN_COPY.resendIn} {formatSeconds(resendIn)}
          </span>
        ) : (
          <Link render={<button type="button" />} onClick={onResend}>
            {SIGN_IN_COPY.resend}
          </Link>
        )}
      </p>
    </div>
  )
}

/** Seconds as a clock: `0:24`. */
function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export type SignInDoneStepProps = StepBaseProps & {
  mode: SignInMode
  name: string
  email: string
  onRestart: () => void
}

/** In: the workspace is on its way. An app would move to it; the demo offers to start over. */
export function SignInDoneStep({ mode, name, email, moved, opening, onRestart }: SignInDoneStepProps) {
  const ref = useRef<HTMLDivElement>(null)
  useStepFocus(ref, moved)
  const firstName = name.trim().split(/\s+/)[0]
  const title = mode === 'sign-up' && firstName ? `${SIGN_IN_COPY[mode].done}, ${firstName}` : SIGN_IN_COPY[mode].done

  return (
    <div ref={ref} className={styles.root()}>
      <div {...rise(opening, 0, styles.intro())}>
        {/* Focused when a person arrives, so screen readers read where they are. */}
        <h1 tabIndex={-1} data-step-focus className={styles.title()}>
          {title}
        </h1>
        <p className={styles.lead()}>
          {SIGN_IN_COPY.signedInAs} <span className={styles.email()}>{email}</span>.
        </p>
      </div>
      <p role="status" {...rise(opening, 1, styles.status())}>
        <Spinner size="s" decorative />
        {SIGN_IN_COPY.opening}
      </p>
      <p {...rise(opening, 2, styles.note())}>
        <Link render={<button type="button" />} onClick={onRestart}>
          {SIGN_IN_COPY.otherAccount}
        </Link>
      </p>
    </div>
  )
}
