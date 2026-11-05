/** Where the agent is: still thinking, or done. */
export const REASONING_STATUSES = ['thinking', 'done'] as const

/** The header's words. English defaults: pass `labels` to translate. */
export const REASONING_LABELS = {
  thinking: 'Thinking',
  done: (time: string) => `Thought for ${time}`,
}
