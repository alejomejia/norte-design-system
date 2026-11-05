/** What screen readers hear by default. Say what's loading when you can: "Loading results". */
export const SKELETON_LABEL = 'Loading'

/** A circle's sizes, Avatar's own, so it can stand in for one: `s` (24px), `m` (32px) or `l` (40px). */
export const SKELETON_CIRCLE_SIZES = ['s', 'm', 'l'] as const

/** The type sizes a text placeholder can stand in for: each line takes that size's line height. */
export const SKELETON_TEXT_SIZES = ['caption', 'body-s', 'body', 'heading-s', 'heading-m'] as const
