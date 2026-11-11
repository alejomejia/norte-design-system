import { type SIGN_IN_MODES, type SIGN_IN_STEPS } from './sign-in.const'

/** `sign-in` for an account that exists, `sign-up` for a new one. */
export type SignInMode = (typeof SIGN_IN_MODES)[number]

/** Where the form is: `details`, `code`, then `done`. */
export type SignInStep = (typeof SIGN_IN_STEPS)[number]
