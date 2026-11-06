/** An avatar's sizes: `s` (24px) in dense rows and the sidebar, `m` (32px) in messages and cards, `l` (40px) in profiles and dialogs. */
export const AVATAR_SIZES = ['s', 'm', 'l'] as const

/** Who an avatar shows: a person (a photo or initials) or an agent (its colors in motion). */
export const AVATAR_KINDS = ['person', 'agent'] as const

/** How an agent's colors move: `orb` swirls like liquid lit as a sphere, `mesh` blends four drifting points. */
export const AVATAR_EFFECTS = ['orb', 'mesh'] as const

/** The states a status dot can show. */
export const AVATAR_STATUSES = ['online', 'away', 'busy', 'offline'] as const

/** What screen readers hear for each status, after the name. */
export const AVATAR_STATUS_LABELS = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
} as const satisfies Record<(typeof AVATAR_STATUSES)[number], string>

/**
 * How long a photo may take before the initials show, in ms. A photo that loads quickly appears without a flash of
 * initials first; a slow one gets them while it loads.
 */
export const AVATAR_FALLBACK_DELAY = 300

/**
 * An agent's colors, deep to light: the deep one is the shadow, the light one the highlight. Norte's blues by default;
 * any CSS color works, `var(--…)` included.
 */
export const AVATAR_AGENT_COLORS = ['var(--color-blue-800)', 'var(--color-blue-500)', 'var(--color-blue-200)'] as const
