'use client'

import { type FormEvent, useId, useState } from 'react'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Dialog } from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { TextField } from '@/components/text-field'
import { useToast } from '@/components/toast'
import { Tooltip } from '@/components/tooltip'
import sofiaPhoto from '@/handbook/assets/people/sofia-herrera.jpg'

import { RUN_VIEW_COPY, RUN_VIEW_EMAIL_PATTERN, RUN_VIEW_ME, RUN_VIEW_TIMING } from './run-view.const'
import { useAfter } from './run-view.hooks'
import { runViewHeaderStyles, runViewShareStyles } from './run-view.styles'

const styles = runViewShareStyles()
const header = runViewHeaderStyles()

export type RunViewShareProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Copies the run's link, and says so. */
  onCopyLink: () => void
}

/**
 * Share: a button in the header (an icon below 640px) that opens a dialog to invite someone by email, with who already
 * has access. Inviting checks the email, sends it to a pretend server, and adds the person to the list.
 */
export function RunViewShare({ open, onOpenChange, onCopyLink }: RunViewShareProps) {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [invited, setInvited] = useState<string[]>([])
  const accessId = useId()

  useAfter(sending, RUN_VIEW_TIMING.invite, () => {
    setSending(false)
    setSent(true)
    setInvited((current) => (current.includes(email) ? current : [...current, email]))
    setEmail('')
    toast.add({ title: RUN_VIEW_COPY.invited(email), description: RUN_VIEW_COPY.invitedNote, type: 'success' })
  })

  function invite(event: FormEvent) {
    event.preventDefault()
    const value = email.trim()
    if (!RUN_VIEW_EMAIL_PATTERN.test(value)) {
      setError(value ? RUN_VIEW_COPY.inviteInvalid : RUN_VIEW_COPY.inviteMissing)
      return
    }
    setEmail(value)
    setSent(false)
    setSending(true)
  }

  function type(value: string) {
    setEmail(value)
    setError(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger
        render={
          <Button variant="secondary" size="s" className={header.wide()}>
            {RUN_VIEW_COPY.share}
          </Button>
        }
      />
      <Tooltip content={RUN_VIEW_COPY.shareRun}>
        <Dialog.Trigger
          render={<IconButton icon="share" label={RUN_VIEW_COPY.shareRun} size="s" className={header.narrow()} />}
        />
      </Tooltip>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>{RUN_VIEW_COPY.shareTitle}</Dialog.Title>
          <Dialog.Description>{RUN_VIEW_COPY.shareLead}</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body className={styles.body()}>
          <form noValidate onSubmit={invite} className={styles.invite()}>
            <TextField
              label={RUN_VIEW_COPY.inviteLabel}
              type="email"
              autoComplete="off"
              placeholder={RUN_VIEW_COPY.invitePlaceholder}
              value={email}
              onValueChange={type}
              error={error}
            />
            <Button
              type="submit"
              variant="secondary"
              loading={sending}
              success={sent}
              className={styles.inviteButton()}
            >
              {RUN_VIEW_COPY.invite}
            </Button>
          </form>
          <section aria-labelledby={accessId} className={styles.people()}>
            <h3 id={accessId} className={styles.peopleTitle()}>
              {RUN_VIEW_COPY.peopleWithAccess}
            </h3>
            <ul className={styles.list()}>
              <li className={styles.person()}>
                <Avatar name={RUN_VIEW_ME.name} src={sofiaPhoto} decorative />
                <div className={styles.who()}>
                  <span className={styles.name()}>
                    {RUN_VIEW_ME.name} {RUN_VIEW_COPY.you}
                  </span>
                  <span className={styles.email()}>{RUN_VIEW_ME.email}</span>
                </div>
                <span className={styles.role()}>{RUN_VIEW_COPY.owner}</span>
              </li>
              <li className={styles.person()}>
                <Avatar name={RUN_VIEW_COPY.teamAccess} decorative />
                <div className={styles.who()}>
                  <span className={styles.name()}>{RUN_VIEW_COPY.teamAccess}</span>
                  <span className={styles.email()}>{RUN_VIEW_COPY.teamAccessNote}</span>
                </div>
                <span className={styles.role()}>{RUN_VIEW_COPY.canView}</span>
              </li>
              {invited.map((person) => (
                <li key={person} className={styles.person()}>
                  <Avatar name={person} decorative />
                  <div className={styles.who()}>
                    <span className={styles.name()}>{person}</span>
                  </div>
                  <span className={styles.role()}>{RUN_VIEW_COPY.canView}</span>
                </li>
              ))}
            </ul>
          </section>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="secondary" onClick={onCopyLink}>
            {RUN_VIEW_COPY.copyLink}
          </Button>
          <Dialog.Close render={<Button>{RUN_VIEW_COPY.done}</Button>} />
        </Dialog.Footer>
        <Dialog.Close />
      </Dialog.Popup>
    </Dialog>
  )
}
