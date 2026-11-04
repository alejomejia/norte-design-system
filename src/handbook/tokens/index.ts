// The tokens of `theme.css`, parsed once for every handbook page.
import themeCss from '@/styles/theme.css?raw'

import { parseTokens, type Token } from './tokens'

export { contrastRatio, oklchToLinearRgb, parseOklch, toHex } from './color'
export type { Token } from './tokens'

export const TOKENS = parseTokens(themeCss)

/** A token by name (`color-ink`). Throws if it's missing, so a renamed token breaks the page instead of hiding. */
export function token(name: string): Token {
  const found = TOKENS.get(name)
  if (!found) throw new Error(`No --${name} token in theme.css`)
  return found
}
