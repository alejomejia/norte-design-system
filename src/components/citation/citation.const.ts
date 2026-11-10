/**
 * How long the pointer rests on a citation before its preview opens, in ms. Shorter than Base UI's 600: citations sit
 * in text people read with the pointer nearby, and a reader who points at one wants to see it.
 */
export const CITATION_DELAY = 400

/** The gap between the marker and its preview, in px. */
export const CITATION_SIDE_OFFSET = 8

/** What screen readers hear before a citation's number and its source's title: "Source 2: …". */
export const CITATION_LABEL = 'Source'

/** Announced after a citation that opens its source in a new tab. */
export const CITATION_NEW_TAB_LABEL = '(opens in a new tab)'
