/** A toast's kinds, set with `type` when it's added: each brings its icon. Without a type, it has none. */
export const TOAST_TYPES = ['success', 'error', 'warning', 'info', 'loading'] as const

/** How many toasts show at once by default; older ones leave as new ones come. */
export const TOAST_LIMIT = 3

/** How long a toast stays by default, in ms. Hovering the stack pauses it. */
export const TOAST_TIMEOUT = 5000
