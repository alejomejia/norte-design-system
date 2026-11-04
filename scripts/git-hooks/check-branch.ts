// The `pre-commit` and `pre-push` hooks: no commits on main, and branch names that follow the rules
// (CONTRIBUTING.md → Branch names).
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

import { checkBranchName } from './git-rules.ts'
import { fail } from './report.ts'

const MAIN = 'main'
const NO_COMMIT = /^0+$/

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

/** Whether git is finishing a merge, which is allowed on any branch, main included. */
function isMerging(): boolean {
  return existsSync(git('rev-parse', '--git-path', 'MERGE_HEAD'))
}

function checkCommit() {
  const branch = currentBranch()
  if (!branch || isMerging()) return

  if (branch === MAIN) {
    fail(
      'Commits never go straight to main.',
      ['Every change arrives through a branch and a pull request.'],
      'Move your work to a branch (your changes come with you): git switch -c nt-<issue>/<verb>-<what>',
    )
  }

  const problems = checkBranchName(branch)
  if (problems.length > 0) {
    fail(`The branch name \`${branch}\` breaks the rules:`, problems, 'Rename it with `git branch -m <new-name>`.')
  }
}

function checkPush() {
  // git sends one line per ref: `<local ref> <local sha> <remote ref> <remote sha>`.
  for (const line of readFileSync(0, 'utf8').split('\n')) {
    const [, localSha = '', remoteRef = ''] = line.split(' ')
    if (!remoteRef.startsWith('refs/heads/') || NO_COMMIT.test(localSha)) continue

    const branch = remoteRef.slice('refs/heads/'.length)
    if (branch === MAIN) continue

    const problems = checkBranchName(branch)
    if (problems.length > 0) {
      fail(`The branch name \`${branch}\` breaks the rules:`, problems, 'Rename it with `git branch -m <new-name>`.')
    }
  }
}

const mode = process.argv[2]
if (mode === 'pre-commit') checkCommit()
else if (mode === 'pre-push') checkPush()
else throw new Error('Usage: check-branch.ts <pre-commit|pre-push>')
