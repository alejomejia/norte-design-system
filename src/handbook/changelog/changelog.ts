/**
 * Reads the release notes for the Changelog page: the versions written to `CHANGELOG.md` by `pnpm release:version`,
 * and the changesets waiting in `.changeset/` for the next one. Pure: the caller brings the text (`?raw` in Storybook,
 * `readFileSync` in Node).
 */

/** How big a change is, as its changeset says. */
export type Bump = 'major' | 'minor' | 'patch'

/** The bumps from the biggest to the smallest: a release takes the first one any of its notes has. */
export const BUMPS = ['major', 'minor', 'patch'] as const satisfies readonly Bump[]

/** One note of a release: what changed for the people who install the package. */
export type ChangelogEntry = {
  bump: Bump
  /** Markdown, as the changeset wrote it. */
  text: string
  /** The short hash of the commit that added the note, when the changelog recorded it. */
  commit?: string
}

/** One version of `CHANGELOG.md`, with its notes in the order they were written. */
export type Release = {
  /** `0.2.0`, without a `v`. */
  version: string
  entries: ChangelogEntry[]
}

// `## 0.2.0`, `### Minor Changes`, and a note's first line: `- 1b5cc4a: Add Icon…` (the hash is there when git was).
const VERSION_HEADING = /^## (\d+\.\d+\.\d+)\s*$/
const BUMP_HEADING = /^### (Major|Minor|Patch) Changes\s*$/
const ENTRY = /^- (?:([0-9a-f]{7,40}): )?(.*)$/
// The frontmatter of a changeset: `'norte-design-system': minor`, quoted or not.
const CHANGESET = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/
const CHANGESET_BUMP = /^\s*['"]?[\w@/.-]+['"]?\s*:\s*(major|minor|patch)\s*$/m

/**
 * Every version of `CHANGELOG.md`, newest first, as Changesets writes them: a `##` heading per version, a `###` heading
 * per bump, and a list item per note, whose next lines are indented two spaces.
 */
export function parseChangelog(markdown: string): Release[] {
  const releases: Release[] = []
  let bump: Bump | undefined
  let entry: ChangelogEntry | undefined

  for (const line of markdown.split('\n')) {
    const version = VERSION_HEADING.exec(line)?.[1]
    if (version) {
      releases.push({ version, entries: [] })
      bump = undefined
      entry = undefined
      continue
    }

    const heading = BUMP_HEADING.exec(line)?.[1]
    if (heading) {
      bump = heading.toLowerCase() as Bump
      entry = undefined
      continue
    }

    const release = releases.at(-1)
    if (!release || !bump) continue

    const item = ENTRY.exec(line)
    if (item) {
      entry = { bump, text: item[2] ?? '', commit: item[1] }
      release.entries.push(entry)
    } else if (entry && (line.startsWith('  ') || line.trim() === '')) {
      entry.text += `\n${line.slice(2)}`
    } else {
      entry = undefined
    }
  }

  for (const { entries } of releases) {
    for (const item of entries) item.text = item.text.trim()
  }
  return releases
}

/**
 * A changeset file's bump and note.
 * @throws if the file has no frontmatter or no bump, so a broken changeset breaks the page instead of hiding.
 */
export function parseChangeset(markdown: string): ChangelogEntry {
  const [, frontmatter = '', body = ''] = CHANGESET.exec(markdown) ?? []
  const bump = CHANGESET_BUMP.exec(frontmatter)?.[1] as Bump | undefined
  if (!bump) throw new Error(`A changeset without a bump:\n${markdown}`)
  return { bump, text: body.trim() }
}

/** The biggest bump among some notes, or nothing if there are none. */
export function biggestBump(entries: readonly ChangelogEntry[]): Bump | undefined {
  return BUMPS.find((bump) => entries.some((entry) => entry.bump === bump))
}

/** The version a bump takes `version` to, by Semantic Versioning: `0.1.3` and `minor` give `0.2.0`. */
export function nextVersion(version: string, bump: Bump): string {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)
  if (bump === 'major') return `${major + 1}.0.0`
  if (bump === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}
