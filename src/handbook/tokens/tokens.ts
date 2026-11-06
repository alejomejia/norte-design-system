/**
 * Reads the tokens of `theme.css` from its text, for the handbook pages and for the contrast test, so both show the
 * values that ship. Pure: the caller brings the CSS (`?raw` in Storybook, `readFileSync` in Node).
 */

export type Token = {
  /** Without the leading `--`: `color-ink-muted`. */
  name: string
  /** The final value, with every `var()` resolved: `oklch(0.446 0.012 260)`. */
  value: string
  /** The token it points at, for roles: `color-neutral-600`. */
  reference?: string
  /** How much of its reference shows, for a translucent role (`color-mix(…, var(--x) 10%, transparent)`): `0.1`. */
  alpha?: number
  /** The comment at the end of its line in `theme.css`. */
  note?: string
}

// A declaration and the comment after it, if any: `--color-ink: var(--color-neutral-900); /* Text */`.
const DECLARATION = /--([\w-]+):\s*([^;]+);[ \t]*(?:\/\*\s*(.*?)\s*\*\/)?/g
const VAR = /^var\(--([\w-]+)\)$/
// A token mixed with transparent, so it's translucent: `color-mix(in oklab, var(--color-neutral-900) 10%, transparent)`.
const MIX = /^color-mix\(\s*in \w+,\s*var\(--([\w-]+)\)\s+([\d.]+)%,\s*transparent\s*\)$/

/** Every token in `theme.css` by name. The first declaration wins, so the reduced-motion overrides are skipped. */
export function parseTokens(css: string): Map<string, Token> {
  const raw = new Map<string, { value: string; note?: string }>()
  for (const [, name = '', value = '', note] of css.matchAll(DECLARATION)) {
    if (!raw.has(name)) raw.set(name, { value: value.trim(), note })
  }

  function resolve(value: string, seen: string[] = []): string {
    const reference = VAR.exec(value)?.[1]
    if (!reference) return value
    if (seen.includes(reference)) throw new Error(`Circular token: ${[...seen, reference].join(' → ')}`)
    const next = raw.get(reference)
    if (!next) throw new Error(`Unknown token: --${reference}`)
    return resolve(next.value, [...seen, reference])
  }

  function toToken(name: string, value: string, note?: string): Token {
    const [, mixed, percent] = MIX.exec(value) ?? []
    if (mixed && percent) {
      return { name, value: resolve(`var(--${mixed})`), reference: mixed, alpha: Number(percent) / 100, note }
    }
    return { name, value: resolve(value), reference: VAR.exec(value)?.[1], note }
  }

  return new Map([...raw].map(([name, { value, note }]) => [name, toToken(name, value, note)]))
}
