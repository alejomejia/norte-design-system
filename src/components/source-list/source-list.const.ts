/** Whether the agent could read a source: `read`, or `failed` (a page that timed out, a file it couldn't open). */
export const SOURCE_LIST_STATUSES = ['read', 'failed'] as const

/** The words Source list says, in English: pass `labels` to translate. */
export const SOURCE_LIST_LABELS = {
  /** The fold's label: "5 sources". */
  count: (count: number) => `${count} ${count === 1 ? 'source' : 'sources'}`,
  /** After the count when some failed: "1 failed". */
  failed: (count: number) => `${count} failed`,
  /** What screen readers hear before a source's number and title: "Source 2: …", as Citation says it. */
  source: 'Source',
  /** What screen readers hear after a failed source's title and site. */
  failedSource: 'failed',
  /** Announced after the name of a source that opens in a new tab. */
  newTab: '(opens in a new tab)',
}

/** How many favicons the folded row stacks: enough to say where the agent looked, few enough to stay a glance. */
export const SOURCE_LIST_STACK_MAX = 4

/** The time between one row's rise and the next as the list opens, in ms. */
export const SOURCE_LIST_STAGGER = 40
