// Reads the color tokens of `src/styles/theme.css`, with every `var()` resolved to its oklch() value.
import { readFileSync } from 'node:fs'

const THEME_FILE = new URL('../../src/styles/theme.css', import.meta.url)
const DECLARATION = /--(color-[\w-]+):\s*([^;]+);/g

function declarations(block: string): Map<string, string> {
  return new Map([...block.matchAll(DECLARATION)].map(([, name = '', value = '']) => [name, value.trim()]))
}

function block(css: string, opening: string): string {
  const start = css.indexOf(opening)
  if (start === -1) throw new Error(`theme.css has no \`${opening}\` block`)
  return css.slice(start, css.indexOf('}', start))
}

/** Every color token, by name without the leading `--` (`color-accent`), resolved to oklch(). */
export function readColors(): Map<string, string> {
  const tokens = declarations(block(readFileSync(THEME_FILE, 'utf8'), '@theme static {'))

  function resolve(value: string, seen: string[] = []): string {
    const reference = /^var\(--([\w-]+)\)$/.exec(value)?.[1]
    if (!reference) return value
    if (seen.includes(reference)) throw new Error(`Circular token: ${[...seen, reference].join(' → ')}`)
    const next = tokens.get(reference)
    if (next === undefined) throw new Error(`Unknown token: --${reference}`)
    return resolve(next, [...seen, reference])
  }

  return new Map([...tokens].map(([name, value]) => [name, resolve(value)]))
}
