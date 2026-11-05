/**
 * `Omit` that keeps a union a union: it omits from each member on its own, so props shaped like `A | B` (a person or an
 * agent) still tell their members apart afterwards. The built-in `Omit` would merge them into one shape.
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
