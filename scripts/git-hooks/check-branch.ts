// The `pre-commit` hook: commits never go straight to main, which only moves on a release, through
// `pnpm release:main` (CONTRIBUTING.md → Branches). That script writes main's commit without a checkout, so no hook runs.
import { execFileSync } from 'node:child_process'

import { fail } from './report.ts'

function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

/** The current branch, or `null` when HEAD is detached (a rebase, a bisect). */
function currentBranch(): string | null {
  try {
    return git('symbolic-ref', '--short', 'HEAD')
  } catch {
    return null
  }
}

if (currentBranch() === 'main') {
  fail(
    'Commits never go straight to main.',
    ['main only moves on a release, through pnpm release:main.'],
    'Move your work to dev (your changes come with you): git switch dev',
  )
}
