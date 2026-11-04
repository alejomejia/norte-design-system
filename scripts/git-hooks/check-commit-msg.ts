// The `commit-msg` hook: checks the message git is about to save (CONTRIBUTING.md → Commits).
import { readFileSync } from 'node:fs'

import { checkCommitMessage } from './git-rules.ts'
import { fail } from './report.ts'

const file = process.argv[2]
if (!file) throw new Error('Usage: check-commit-msg.ts <path to the commit message file>')

const problems = checkCommitMessage(readFileSync(file, 'utf8'))
if (problems.length > 0) {
  fail(
    'This commit message breaks the rules:',
    problems,
    `Commit again with a fixed message. Yours is saved in ${file}.`,
  )
}
