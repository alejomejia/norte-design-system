// The `pre-commit` hook: commits never go straight to main, which only moves when a release is merged from dev
// (CONTRIBUTING.md → Branches).
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'

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

/** Whether git is finishing a merge, the one way main moves. */
function isMerging(): boolean {
  return existsSync(git('rev-parse', '--git-path', 'MERGE_HEAD'))
}

if (currentBranch() === 'main' && !isMerging()) {
  fail(
    'Commits never go straight to main.',
    ['main only moves when a release is merged from dev.'],
    'Move your work to dev (your changes come with you): git switch dev',
  )
}
