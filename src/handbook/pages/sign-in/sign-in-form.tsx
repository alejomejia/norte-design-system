'use client'

import { AnimatePresence, LazyMotion, MotionConfig, type Variants } from 'motion/react'
import * as m from 'motion/react-m'
import { useState } from 'react'

import { useToast } from '@/components/toast'
import { loadMotionFeatures, MOTION_DURATION, MOTION_EASE } from '@/lib/motion'

import {
  SIGN_IN_COPY,
  SIGN_IN_DEMO_CODE,
  SIGN_IN_EMAIL_PATTERN,
  SIGN_IN_LATENCY,
  SIGN_IN_RESEND_AFTER,
  SIGN_IN_SUCCESS_HOLD,
} from './sign-in.const'
import { useAfter, useCountdown } from './sign-in.hooks'
import { type SignInMode, type SignInStep } from './sign-in.types'
import { SignInCodeStep, SignInDetailsStep, SignInDoneStep } from './sign-in-steps'

/** How far a step slides as it comes and goes, in px: forward from the right, back from the left. */
const SLIDE = 8

/** A step leaves quickly toward where the person came from, and the next one arrives at the pace of new content. */
const STEP_MOTION: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: SLIDE * direction }),
  center: { opacity: 1, x: 0, transition: { duration: MOTION_DURATION.appear, ease: MOTION_EASE.enter } },
  exit: (direction: number) => ({
    opacity: 0,
    x: -SLIDE * direction,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.exit },
  }),
}

export type SignInFormProps = {
  /** Which way in the form opens on. */
  defaultMode?: SignInMode
  /** The step it opens on. */
  defaultStep?: SignInStep
  defaultName?: string
  defaultEmail?: string
}

/**
 * Signs a person in, or up, with a code sent to their work email: their details, then the code, then in. The server is
 * pretend: it takes `SIGN_IN_LATENCY` to answer and accepts only `SIGN_IN_DEMO_CODE`, which the "code sent" toast gives.
 */
export function SignInForm({
  defaultMode = 'sign-in',
  defaultStep = 'details',
  defaultName = '',
  defaultEmail = '',
}: SignInFormProps) {
  const toast = useToast()
  const [mode, setMode] = useState(defaultMode)
  const [step, setStep] = useState(defaultStep)
  // Whether a person has moved between steps: from then on, each new step takes focus and slides in.
  const [moved, setMoved] = useState(false)
  const [direction, setDirection] = useState(1)

  const [name, setName] = useState(defaultName)
  const [email, setEmail] = useState(defaultEmail)
  const [nameError, setNameError] = useState<string>()
  const [emailError, setEmailError] = useState<string>()
  const [sending, setSending] = useState(false)

  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string>()
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const resend = useCountdown(SIGN_IN_RESEND_AFTER)

  function go(next: SignInStep, way: 1 | -1 = 1) {
    setDirection(way)
    setMoved(true)
    setStep(next)
  }

  function sendCode() {
    const trimmed = email.trim()
    const nextNameError = mode === 'sign-up' && !name.trim() ? SIGN_IN_COPY.nameMissing : undefined
    const nextEmailError = !trimmed
      ? SIGN_IN_COPY.emailMissing
      : SIGN_IN_EMAIL_PATTERN.test(trimmed)
        ? undefined
        : SIGN_IN_COPY.emailInvalid
    setNameError(nextNameError)
    setEmailError(nextEmailError)
    if (nextNameError || nextEmailError) return
    setEmail(trimmed)
    setSending(true)
  }

  useAfter(sending, SIGN_IN_LATENCY, () => {
    setSending(false)
    setCode('')
    setCodeError(undefined)
    resend.restart()
    go('code')
    toast.add({ title: SIGN_IN_COPY.codeSent, description: SIGN_IN_COPY.demoHint, type: 'success' })
  })

  function verify(value: string) {
    if (verifying || verified) return
    if (value.length < SIGN_IN_DEMO_CODE.length) {
      setCodeError(SIGN_IN_COPY.codeIncomplete)
      return
    }
    setCode(value)
    setCodeError(undefined)
    setVerifying(true)
  }

  useAfter(verifying, SIGN_IN_LATENCY, () => {
    setVerifying(false)
    if (code === SIGN_IN_DEMO_CODE) setVerified(true)
    else setCodeError(SIGN_IN_COPY.codeWrong)
  })

  useAfter(verified, SIGN_IN_SUCCESS_HOLD, () => go('done'))

  // Checked whenever it's whole, not only the first time: Base UI's `onValueComplete` stays quiet when a person fixes
  // one digit of a full code, after a wrong one.
  function changeCode(value: string) {
    setCode(value)
    setCodeError(undefined)
    if (value.length === SIGN_IN_DEMO_CODE.length) verify(value)
  }

  function resendCode() {
    setCode('')
    setCodeError(undefined)
    resend.restart()
    toast.add({ title: SIGN_IN_COPY.newCodeSent, description: SIGN_IN_COPY.demoHint, type: 'success' })
  }

  function switchMode() {
    setNameError(undefined)
    setEmailError(undefined)
    setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
    go('details')
  }

  function restart() {
    setName('')
    setEmail('')
    setCode('')
    setVerified(false)
    setMode(defaultMode)
    go('details', -1)
  }

  const base = { moved, opening: !moved }
  // A new key for each step, and for each way in, so switching between them slides too.
  const key = step === 'details' ? `details-${mode}` : step

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <m.div
            key={key}
            data-step={key}
            custom={direction}
            variants={STEP_MOTION}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 'details' && (
              <SignInDetailsStep
                {...base}
                mode={mode}
                name={name}
                email={email}
                nameError={nameError}
                emailError={emailError}
                sending={sending}
                onNameChange={(value) => {
                  setName(value)
                  setNameError(undefined)
                }}
                onEmailChange={(value) => {
                  setEmail(value)
                  setEmailError(undefined)
                }}
                onSubmit={sendCode}
                onSwitchMode={switchMode}
              />
            )}
            {step === 'code' && (
              <SignInCodeStep
                {...base}
                email={email}
                code={code}
                error={codeError}
                verifying={verifying}
                verified={verified}
                resendIn={resend.left}
                onCodeChange={changeCode}
                onSubmit={verify}
                onChangeEmail={() => go('details', -1)}
                onResend={resendCode}
              />
            )}
            {step === 'done' && <SignInDoneStep {...base} mode={mode} name={name} email={email} onRestart={restart} />}
          </m.div>
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  )
}
