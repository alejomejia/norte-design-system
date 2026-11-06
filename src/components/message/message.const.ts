/** Who wrote a message: a person or an agent. The person's words sit on a quiet tint; the agent's work stays open. */
export const MESSAGE_KINDS = ['person', 'agent'] as const

/** Where an agent's message is: `thinking` before it writes, `streaming` while the words arrive, then `done`. */
export const MESSAGE_STATUSES = ['thinking', 'streaming', 'done'] as const

/** What the header says while the agent works, in place of the time. */
export const MESSAGE_STATUS_LABELS = {
  thinking: 'Thinking',
  streaming: 'Writing',
} as const

/** What the copy action says and announces, to translate them. */
export const MESSAGE_COPY_LABELS = {
  /** Its tooltip and accessible name. */
  copy: 'Copy',
  /** Its tooltip after a copy, announced to screen readers. */
  copied: 'Copied',
} as const

/** How a message's time reads: the hour and minute, in the reader's own locale ("10:42 AM", "10:42"). */
export const MESSAGE_TIME_FORMAT = { hour: 'numeric', minute: '2-digit' } as const satisfies Intl.DateTimeFormatOptions
