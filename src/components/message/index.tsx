'use client'

import { type ComponentProps, type ReactNode, useId, useMemo } from 'react'

import { Avatar, type AvatarProps } from '@/components/avatar'
import { type DistributiveOmit, flattenChildren, nameParts } from '@/lib/utils'

import {
  MESSAGE_STATUS_LABELS,
  type MESSAGE_STATUSES,
  type MESSAGE_THINKING_EFFECTS,
  MESSAGE_TIME_FORMAT,
} from './message.const'
import { MessageContext } from './message.hooks'
import { messageStyles } from './message.styles'
import { MessageAction, MessageActions, MessageContent, MessageCopy } from './message-parts'
import { MessageStatus } from './message-status'

export type {
  MessageActionProps,
  MessageActionsProps,
  MessageContentProps,
  MessageCopyProps,
} from './message-parts'

/** Who wrote a message, as an `Avatar` takes them: a person (`name`, `src`) or an agent (`kind: 'agent'`, `effect`). */
export type MessageAuthor = DistributiveOmit<AvatarProps, 'size' | 'decorative' | 'className'>

type MessageBaseProps = Omit<ComponentProps<'article'>, 'className' | 'children'> & {
  /** When it was written. It reads as the hour and minute, in the reader's locale. */
  time?: Date
  /** Shows the actions without a hover or focus, for the conversation's latest message. */
  actionsVisible?: boolean
  /** Fades in and rises as it mounts: for a message that just arrived, not for a conversation loaded from history. */
  appear?: boolean
  /** `Message.Content`, then `Message.Actions`. None yet while an agent is thinking. */
  children?: ReactNode
  className?: string
}

type PersonMessageProps = {
  /**
   * Who wrote it, as an `Avatar` takes them. Their name heads the message and names it for screen readers. A person's
   * words sit on a quiet tint; an agent's stay open.
   */
  author: Exclude<MessageAuthor, { kind: 'agent' }>
  status?: never
  statusLabels?: never
  thinkingEffect?: never
  thinkingTimer?: never
  thinkingSince?: never
}

type AgentMessageProps = {
  author: Extract<MessageAuthor, { kind: 'agent' }>
  /**
   * Where an agent's message is: `thinking` before it writes, `streaming` while the words arrive, then `done`. Until
   * it's done, the avatar moves and the actions wait. The header says what it's
   * doing in place of the time, only while there's no content yet: once a plan or the first words show, they say it.
   * Agents only.
   */
  status?: (typeof MESSAGE_STATUSES)[number]
  /** What the header says while the agent thinks and writes, to translate them. */
  statusLabels?: Partial<Record<keyof typeof MESSAGE_STATUS_LABELS, string>>
  /**
   * How the status word shows the agent is working: `breathe` dims and brightens it, `shimmer` sends a light across
   * it, `none` holds it still. Agents only.
   */
  thinkingEffect?: (typeof MESSAGE_THINKING_EFFECTS)[number]
  /** Shows how long the agent has been thinking after "Thinking", in seconds with tenths (`2.4s`). Agents only. */
  thinkingTimer?: boolean
  /**
   * When the agent started thinking (`Date.now()`), so the clock survives a remount. Without it, the clock counts from
   * when the message started thinking. Agents only.
   */
  thinkingSince?: number
}

export type MessageProps = MessageBaseProps & (PersonMessageProps | AgentMessageProps)

/**
 * One turn of a conversation: who wrote it, when, what it says and what can be done with it (copy, retry). An
 * `article`, named by its author and time. While an agent thinks and writes, its avatar moves, and until there's content
 * the header says what it's doing.
 *
 * @example
 * <Message author={{ name: 'Research agent', kind: 'agent' }} time={reply.time} actionsVisible>
 *   <Message.Content>{reply.text}</Message.Content>
 *   <Message.Actions>
 *     <Message.Copy text={reply.text} />
 *     <Message.Action icon="retry" label="Retry" onClick={retry} />
 *   </Message.Actions>
 * </Message>
 */
function MessageRoot({
  author,
  time,
  status: statusProp = 'done',
  statusLabels,
  thinkingEffect = 'breathe',
  thinkingTimer = true,
  thinkingSince,
  actionsVisible = false,
  appear = false,
  children,
  className,
  ...props
}: MessageProps) {
  const headerId = useId()
  const kind = author.kind ?? 'person'
  const styles = messageStyles({ kind, appear })
  // Only an agent works on its message; a person's is always done, whatever reaches it untyped.
  const status = kind === 'agent' ? statusProp : 'done'
  const busy = status !== 'done'
  // The status word only fills a silence: once there's content (a plan, reasoning, the first words), it speaks for itself.
  const hasContent = flattenChildren(children).some((child) => child.type !== MessageActions)
  const state = useMemo(() => ({ kind, busy }), [kind, busy])

  return (
    <MessageContext value={state}>
      <article
        {...props}
        // Never `aria-busy`: some screen readers hold back live regions inside a busy element, and a streaming answer
        // announces its paragraphs as they complete. The status word in the header names the state instead.
        aria-labelledby={headerId}
        data-kind={kind}
        data-actions-visible={actionsVisible || undefined}
        className={styles.root({ className })}
      >
        {/* Decorative: the name is written beside it. */}
        <Avatar {...author} live={author.live ?? busy} size="m" decorative className={styles.avatar()} />
        <div className={styles.body()}>
          <header id={headerId} className={styles.header()}>
            <span className={styles.author()}>{author.name}</span>
            {status !== 'done'
              ? !hasContent && (
                  // Keyed by status, so "Writing" starts fresh after "Thinking".
                  <MessageStatus
                    key={status}
                    label={{ ...MESSAGE_STATUS_LABELS, ...statusLabels }[status]}
                    effect={thinkingEffect}
                    timer={thinkingTimer && status === 'thinking'}
                    since={thinkingSince}
                  />
                )
              : time && (
                  // The server's locale and time zone may differ from the reader's: the client's reading wins.
                  <time dateTime={time.toISOString()} suppressHydrationWarning className={styles.time()}>
                    {time.toLocaleTimeString(undefined, MESSAGE_TIME_FORMAT)}
                  </time>
                )}
          </header>
          {children}
        </div>
      </article>
    </MessageContext>
  )
}

// The root's name too: its function is `MessageRoot`.
MessageRoot.displayName = 'Message'

export const Message = Object.assign(
  MessageRoot,
  nameParts('Message', {
    Content: MessageContent,
    Actions: MessageActions,
    Action: MessageAction,
    Copy: MessageCopy,
  }),
)
