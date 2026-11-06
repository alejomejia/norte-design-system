/**
 * How a new word comes in: it rises into place, fades in, clears a blur, or arrives in accent ink and dries to the
 * text's color.
 */
export const STREAMING_TEXT_REVEALS = ['rise', 'fade', 'blur', 'ink'] as const

/** How often a smoothed stream reveals more words, in ms. */
export const STREAMING_TEXT_TICK = 40

/**
 * How quickly a smoothed stream catches up, in ms: each tick reveals the share of the hidden text that would clear it
 * in this time. It's also about how far behind the stream the words trail while text keeps arriving.
 */
export const STREAMING_TEXT_CATCH_UP = 500
