import { Markdown } from '@storybook/addon-docs/blocks'
import { type ReactNode } from 'react'

import {
  BUMPS,
  type Bump,
  biggestBump,
  type ChangelogEntry,
  COMPONENT_DOCS,
  nextVersion,
  PENDING,
  RELEASES,
} from '@/handbook/changelog'
import { cn } from '@/lib/utils'

import { DocsLink, StorybookLink } from './docs-link'

/** Where a note's commit is read: the public repository. */
const COMMIT_URL = 'https://github.com/alejomejia/norte-design-system/commit/'

/** What a group of notes is called on the page: what it means for an app, not the Changesets name. */
const GROUPS: Record<Bump, string> = {
  major: 'Breaking changes',
  minor: 'New',
  patch: 'Patches',
}

/** The release before the first one: the next release counts from here. */
const FIRST_VERSION = '0.0.0'

/** A heading id unique per version: `v0-2-0`, so "On this page" links each version, not the first one it finds. */
function versionId(version: string) {
  return `v${version.replaceAll('.', '-')}`
}

/** A release date as people read it: `2026-11-04` → `November 4, 2026`. */
function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** A small label next to a version: its bump, or that it isn't out yet. */
function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'accent'; children: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-s border px-2 font-mono text-caption',
        tone === 'accent' ? 'border-transparent bg-accent-subtle text-accent-ink' : 'border-line text-ink-muted',
      )}
    >
      {children}
    </span>
  )
}

/** Inline code in a note: a component's name links to its docs page, where the details are. */
function NoteCode({ children }: { children?: ReactNode }) {
  const href = typeof children === 'string' ? COMPONENT_DOCS[children] : undefined
  return href ? (
    <StorybookLink href={href}>
      <code>{children}</code>
    </StorybookLink>
  ) : (
    <code>{children}</code>
  )
}

/** How a note's Markdown renders: inline, so its commit follows on the same line, with its names linked. */
const NOTE_OPTIONS = { forceInline: true, overrides: { code: NoteCode } }

/** A release's notes, grouped from the biggest bump to the smallest: breaking changes first, fixes last. */
function Notes({ entries, id }: { entries: readonly ChangelogEntry[]; id: string }) {
  return BUMPS.map((bump) => {
    const group = entries.filter((entry) => entry.bump === bump)
    if (group.length === 0) return null

    return (
      <section key={bump} aria-labelledby={`${id}-${bump}`}>
        <h4 id={`${id}-${bump}`} className="flex items-center gap-2">
          {GROUPS[bump]}{' '}
          <span className="sb-unstyled inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-muted px-2 text-caption font-medium text-ink-muted tabular-nums">
            {group.length}
            <span className="sr-only">{group.length === 1 ? ' note' : ' notes'}</span>
          </span>
        </h4>
        <ul className="nt-changelog-notes">
          {group.map(({ text, commit }) => (
            <li key={commit ?? text}>
              <Markdown options={NOTE_OPTIONS}>{text}</Markdown>
              {commit && (
                <DocsLink href={`${COMMIT_URL}${commit}`} className="nt-changelog-commit">
                  {commit.slice(0, 7)}
                </DocsLink>
              )}
            </li>
          ))}
        </ul>
      </section>
    )
  })
}

/**
 * The changesets waiting on `dev`: the version they add up to and their notes. A changeset added to `.changeset/` shows
 * up here with nothing else to update.
 */
export function NextRelease() {
  const bump = biggestBump(PENDING)
  if (!bump) {
    return (
      <p>
        Nothing is waiting: every change on <code>dev</code> has shipped.
      </p>
    )
  }

  const version = nextVersion(RELEASES[0]?.version ?? FIRST_VERSION, bump)
  return (
    <>
      <div className="sb-unstyled mb-6 flex flex-wrap items-center gap-2">
        <Pill tone="accent">{`v${version}`}</Pill>
        <Pill>{bump}</Pill>
        <span className="text-body-s text-ink-subtle">
          {PENDING.length} {PENDING.length === 1 ? 'changeset' : 'changesets'}, not released yet
        </span>
      </div>
      <Notes entries={PENDING} id="next" />
    </>
  )
}

/** Every version of `CHANGELOG.md`, newest first, each a section of "On this page". */
export function Releases() {
  if (RELEASES.length === 0) {
    return (
      <div className="sb-unstyled my-6 rounded-l border border-dashed border-line-strong p-8 text-center">
        <p className="text-body font-semibold text-ink">No version released yet</p>
        <p className="mt-1 text-body-s text-ink-muted">
          The notes under Next release become the first one, with its entry here.
        </p>
      </div>
    )
  }

  return RELEASES.map(({ version, entries }) => {
    const id = versionId(version)
    return (
      <section key={version} aria-labelledby={id}>
        <h3 id={id}>v{version}</h3>
        <div className="sb-unstyled mb-4 flex flex-wrap items-center gap-2">
          <Pill>{biggestBump(entries) ?? 'patch'}</Pill>
          {__RELEASE_DATES__[version] && (
            <time dateTime={__RELEASE_DATES__[version]} className="text-body-s text-ink-subtle">
              {formatDate(__RELEASE_DATES__[version])}
            </time>
          )}
        </div>
        <Notes entries={entries} id={id} />
      </section>
    )
  })
}
