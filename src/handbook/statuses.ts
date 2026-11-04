/**
 * A component's status: one tag on its stories' meta (`tags: ['ready']`). The sidebar shows it next to the component's
 * name, the docs page shows it in the header, and the sidebar's tag filter can show or hide each one.
 */
export const STATUSES = {
  beta: 'Beta',
  ready: 'Ready',
  deprecated: 'Deprecated',
} as const

/** One of the statuses: `beta`, `ready` or `deprecated`. */
export type Status = keyof typeof STATUSES

/** The status among a list of tags, if there is one. */
export function statusOf(tags: readonly string[] | undefined): Status | undefined {
  return tags?.find((tag): tag is Status => tag in STATUSES)
}
