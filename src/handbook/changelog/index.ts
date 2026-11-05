// The release notes, read once for the Changelog page. Globs, not imports: `CHANGELOG.md` only exists after the first
// release, and the changesets come and go, so a missing file reads as nothing instead of breaking the build. `/` is the
// project root in Vite.
import { type ChangelogEntry, componentDocs, parseChangelog, parseChangeset, type Release } from './changelog'

export { BUMPS, type Bump, biggestBump, type ChangelogEntry, nextVersion, type Release } from './changelog'

const changelog = import.meta.glob<string>('/CHANGELOG.md', { query: '?raw', import: 'default', eager: true })
const changesets = import.meta.glob<string>(['/.changeset/*.md', '!/.changeset/README.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Every released version, newest first. */
export const RELEASES: Release[] = parseChangelog(Object.values(changelog)[0] ?? '')

/** The notes waiting for the next release, in file order. */
export const PENDING: ChangelogEntry[] = Object.values(changesets).map(parseChangeset)

const stories = import.meta.glob<string>('/src/components/*/*.stories.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Each component's docs page by its name (`Button`), for linking the names in the notes. */
export const COMPONENT_DOCS: Record<string, string> = componentDocs(stories)
