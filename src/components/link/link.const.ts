/** Where a link sits: `inline` inside a sentence, `standalone` on its own (a list of sources, "View all runs"). */
export const LINK_VARIANTS = ['inline', 'standalone'] as const

/** What `rel` a link that opens a new tab always carries, so the new page can't reach back into this one. */
export const LINK_NEW_TAB_REL = 'noopener noreferrer'
