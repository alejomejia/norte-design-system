// `pnpm release:main`: adds the release to main as one commit holding exactly dev's files, so main's history is the
// first setup commits, then one commit per version (CONTRIBUTING.md → Releasing). It never merges: main has no other
// parent than its previous release, and dev's commits stay on dev, where the tag is.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { fail } from './git-hooks/report.ts'

function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

/** The commit a ref points at, or `null` if it doesn't exist. */
function commitOf(ref: string): string | null {
  try {
    return git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`)
  } catch {
    return null
  }
}

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }
const tag = `v${version}`
const dev = commitOf('dev')
const main = commitOf('main')

if (!dev || !main) fail('No dev or main branch.', ['Both must exist locally.'], 'Fetch them: git fetch origin')

if (commitOf(tag) !== dev) {
  fail(
    `${tag} isn't on dev's last commit.`,
    ['A release is versioned and tagged on dev first, then added to main.'],
    'On dev: pnpm release:version, commit "chore(release): ' + tag + '", then pnpm release:tag',
  )
}

if (git('rev-parse', 'main^{tree}') === git('rev-parse', 'dev^{tree}')) {
  fail('main already has these files.', [`${tag} looks released already.`], 'Push it: git push origin main dev ' + tag)
}

// Writing main's ref while it's checked out would leave the working tree behind it.
if (git('rev-parse', '--abbrev-ref', 'HEAD') === 'main') {
  fail('main is checked out.', ['release:main moves main without checking it out.'], 'Switch first: git switch dev')
}

const release = git('commit-tree', 'dev^{tree}', '-p', main, '-m', `chore(release): ${tag}`)
// The old value guards against main moving between reading it and writing it.
git('update-ref', '-m', `release ${tag}`, 'refs/heads/main', release, main)

console.log(`\n✔ main is at ${tag}: ${release.slice(0, 7)} chore(release): ${tag}`)
console.log(`\n  Push it: git push origin main dev ${tag}\n`)
