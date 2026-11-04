// The tokens of `theme.css`, parsed once for every handbook page.
import themeCss from '@/styles/theme.css?raw'

import { parseTokens, type Token } from './tokens'

export type { Token } from './tokens'

/** Every token of `theme.css`, by name (`color-ink`), with its value, the token it points at and its note. */
export const TOKENS = parseTokens(themeCss)

/**
 * A token by name (`color-ink`).
 * @throws if `theme.css` has no such token, so a renamed token breaks the page instead of hiding.
 */
export function token(name: string): Token {
  const found = TOKENS.get(name)
  if (!found) throw new Error(`No --${name} token in theme.css`)
  return found
}
