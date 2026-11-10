'use client'

import { type ComponentProps, useState } from 'react'

import { IconButton, type IconButtonProps } from '@/components/icon-button'
import { Tooltip } from '@/components/tooltip'
import { useCopy } from '@/lib/hooks'

import { MESSAGE_COPY_LABELS } from './message.const'
import { useMessage } from './message.hooks'
import { messageCopyStyles, messageStyles } from './message.styles'

export type MessageContentProps = Omit<ComponentProps<'div'>, 'className'> & { className?: string }

/** What the message says: text, or an agent's work (a plan, tool calls, an alert, a card), stacked 12px apart. */
export function MessageContent({ className, ...props }: MessageContentProps) {
  const { kind } = useMessage()
  return <div {...props} className={messageStyles({ kind }).content({ className })} />
}

export type MessageActionsProps = Omit<ComponentProps<'div'>, 'className'> & { className?: string }

/**
 * The row of actions under the content. Hidden at rest, it shows while the message is hovered or holds focus, and
 * always on touch screens. Left out until the message is done, so nobody copies or retries half an answer.
 */
export function MessageActions({ className, ...props }: MessageActionsProps) {
  const { busy } = useMessage()
  if (busy) return null
  return <div {...props} className={messageStyles().actions({ className })} />
}

export type MessageActionProps = Omit<IconButtonProps, 'size' | 'variant'> & {
  /** A keyboard shortcut for the same action, shown in its tooltip: `['⌘', 'R']`. */
  shortcut?: string[]
}

/** One action on the message (retry, edit, share): a small ghost icon button, its label in a tooltip. */
export function MessageAction({ label, shortcut, ...props }: MessageActionProps) {
  return (
    <Tooltip content={label} shortcut={shortcut}>
      <IconButton {...props} label={label} size="s" />
    </Tooltip>
  )
}

export type MessageCopyProps = Omit<IconButtonProps, 'icon' | 'label' | 'size' | 'variant' | 'onClick'> & {
  /** What gets copied: the message as plain text or Markdown, not its markup. */
  text: string
  /** What it says and announces, to translate them. */
  labels?: Partial<Record<keyof typeof MESSAGE_COPY_LABELS, string>>
  /** Called once the text is on the clipboard. */
  onCopy?: () => void
}

/**
 * Copies the message. Its icon turns into a check and its tooltip into "Copied" for two seconds, and screen readers
 * hear "Copied". A copy the browser refuses changes nothing.
 */
export function MessageCopy({ text, labels, onCopy, className, ...props }: MessageCopyProps) {
  const { copy: copyLabel, copied: copiedLabel } = { ...MESSAGE_COPY_LABELS, ...labels }
  const [copied, copy] = useCopy()
  // Set on the first copy and kept: from then on, each icon change pops in.
  const [changed, setChanged] = useState(false)
  if (copied && !changed) setChanged(true)

  async function handleClick() {
    if (await copy(text)) onCopy?.()
  }

  return (
    <>
      <Tooltip content={copied ? copiedLabel : copyLabel} closeOnClick={false}>
        <IconButton
          {...props}
          icon={copied ? 'done' : 'copy'}
          label={copyLabel}
          size="s"
          onClick={handleClick}
          className={messageCopyStyles({ changed, className })}
        />
      </Tooltip>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </>
  )
}
