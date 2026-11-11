import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

/** Each helpers entry of the package, and the Helpers page that documents it. */
const ENTRIES = [
  { entry: 'utils', page: 'utilities.mdx' },
  { entry: 'hooks', page: 'hooks.mdx' },
  { entry: 'motion', page: 'motion.mdx' },
]

/** Every name an entry file exports, types included: `export { a, type B } from …` and `export * as c from …`. */
function exportedNames(source: string): string[] {
  const listed = [...source.matchAll(/export\s*\{([^}]*)\}/g)].flatMap(([, list = '']) =>
    list
      .split(',')
      .map((name) => name.replace(/^\s*type\s+/, '').trim())
      .filter(Boolean),
  )
  const namespaces = [...source.matchAll(/export \* as (\w+)/g)].map(([, name = '']) => name)
  return [...listed, ...namespaces]
}

describe('the Helpers pages', () => {
  it.each(ENTRIES)('document every export of /$entry on $page', ({ entry, page }) => {
    const source = readFileSync(new URL(`../../${entry}.ts`, import.meta.url), 'utf8')
    const docs = readFileSync(new URL(`./${page}`, import.meta.url), 'utf8')
    const names = exportedNames(source)

    expect(names.length).toBeGreaterThan(0)
    expect(names.filter((name) => !docs.includes(`\`${name}\``))).toEqual([])
  })
})
