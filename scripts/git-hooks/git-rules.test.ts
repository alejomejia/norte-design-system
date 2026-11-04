import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { checkCommitMessage } from './git-rules.ts'

describe('checkCommitMessage', () => {
  it('accepts conventional commits, with or without a scope and a body', () => {
    for (const message of [
      'feat(button): add a loading state',
      'chore: scaffold React design system with Storybook',
      'fix(menu)!: close on escape\n\nThe menu stayed open when focus was inside a submenu.',
      'chore(release): v0.2.0\n',
    ]) {
      assert.deepEqual(checkCommitMessage(message), [], message)
    }
  })

  it('ignores the comment lines git adds', () => {
    assert.deepEqual(checkCommitMessage('docs: explain changesets\n# Please enter the commit message'), [])
  })

  it('lets the commits git writes itself through', () => {
    for (const message of ["Merge branch 'dev'", 'Revert "feat: add x"', 'fixup! feat: add x']) {
      assert.deepEqual(checkCommitMessage(message), [], message)
    }
  })

  it('rejects messages without a type', () => {
    assert.equal(checkCommitMessage('Add a loading state').length, 1)
  })

  it('rejects unknown types and scopes that are not kebab-case', () => {
    assert.match(checkCommitMessage('feature: add x')[0] ?? '', /type is one of/)
    assert.match(checkCommitMessage('feat(Button): add x')[0] ?? '', /scope/)
  })

  it('checks the summary', () => {
    assert.match(checkCommitMessage('feat: Add x')[0] ?? '', /lowercase/)
    assert.match(checkCommitMessage('feat: add x.')[0] ?? '', /period/)
    assert.match(checkCommitMessage(`feat: ${'a'.repeat(70)}`)[0] ?? '', /72 characters/)
  })

  it('needs an empty line before the body', () => {
    assert.match(checkCommitMessage('feat: add x\nbecause y')[0] ?? '', /empty line/)
  })

  it('rejects AI attribution', () => {
    assert.equal(checkCommitMessage('feat: add x\n\nCo-Authored-By: Claude <noreply@anthropic.com>').length, 1)
    assert.equal(checkCommitMessage('feat: add x\n\nGenerated with Claude Code').length, 1)
  })

  it('allows a human co-author', () => {
    assert.deepEqual(checkCommitMessage('feat: add x\n\nCo-Authored-By: Ana Gómez <ana@example.com>'), [])
  })
})
