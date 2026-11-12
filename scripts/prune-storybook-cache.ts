// Runs before `pnpm dev` and `pnpm build:storybook`, and by hand as `pnpm clean:storybook` (`--all`). Storybook keeps
// its cache in node_modules/.cache/storybook and never cleans it: folders from older Storybook versions stay, and an
// interrupted start leaves Vite's half-written `deps_temp_*` pre-bundles behind, hundreds of files each. Left alone,
// it once grew to thousands of folders and Storybook hung on start. A healthy cache holds a few hundred entries.
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const CACHE = join('node_modules', '.cache', 'storybook')
/** Entries (files and folders) past which the cache is wiped whole. A healthy one holds a few hundred. */
const LIMIT = 3_000

function remove(path: string) {
  rmSync(path, { recursive: true, force: true })
}

/** Counts the entries under `dir`, stopping once past `limit`, so a runaway cache doesn't take long to measure. */
function countEntries(dir: string, limit: number): number {
  let count = 0
  const pending = [dir]
  while (pending.length > 0 && count <= limit) {
    const current = pending.pop() as string
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      count += 1
      if (entry.isDirectory()) pending.push(join(current, entry.name))
    }
  }
  return count
}

/** Removes every `deps_temp_*` folder under `dir`: Vite renames it to `deps` when pre-bundling finishes. */
function removeTempDeps(dir: string): number {
  let removed = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const path = join(dir, entry.name)
    if (entry.name.startsWith('deps_temp_')) {
      remove(path)
      removed += 1
    } else if (entry.name !== 'deps') {
      removed += removeTempDeps(path)
    }
  }
  return removed
}

if (existsSync(CACHE)) {
  if (process.argv.includes('--all')) {
    remove(CACHE)
    console.log('✔ Storybook cache removed. The next start rebuilds it.')
    process.exit(0)
  }

  const { version } = JSON.parse(readFileSync(join('node_modules', 'storybook', 'package.json'), 'utf8')) as {
    version: string
  }
  const notes: string[] = []

  for (const entry of readdirSync(CACHE)) {
    if (entry !== version) {
      remove(join(CACHE, entry))
      notes.push(`old Storybook ${entry}`)
    }
  }

  const current = join(CACHE, version)
  if (existsSync(current)) {
    const temps = removeTempDeps(current)
    if (temps > 0) notes.push(`${temps} unfinished Vite pre-bundle${temps === 1 ? '' : 's'}`)

    if (countEntries(current, LIMIT) > LIMIT) {
      remove(CACHE)
      notes.push(`the whole cache, past ${LIMIT.toLocaleString('en')} entries`)
    }
  }

  if (notes.length > 0) console.log(`✔ Storybook cache pruned: ${notes.join(', ')}.`)
}
