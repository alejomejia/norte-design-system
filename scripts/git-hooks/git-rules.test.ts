import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { checkBranchName, checkCommitMessage } from './git-rules.ts'

describe('checkBranchName', () => {
  it('accepts issue branches and release branches', () => {
    for (const name of ['nt-12/add-button', 'nt-7/fix-menu-focus-ring', 'nt-301/upgrade-storybook', 'release/v0.2.0']) {
      assert.deepEqual(checkBranchName(name), [], name)
    }
  })

  it('rejects a branch without an issue', () => {
    assert.equal(checkBranchName('feature/add-button').length, 1)
    assert.equal(checkBranchName('add-button').length, 1)
  })

  it('asks for a lowercase prefix', () => {
    assert.match(checkBranchName('NT-12/add-button')[0] ?? '', /lowercase/)
  })

  it('rejects descriptions that are not kebab-case ASCII', () => {
    for (const name of ['nt-12/AddButton', 'nt-12/add_button', 'nt-12/añadir-boton', 'nt-12/']) {
      assert.equal(checkBranchName(name).length, 1, name)
    }
  })

  it('needs one of the verbs and 2 to 5 words', () => {
    assert.match(checkBranchName('nt-12/create-button')[0] ?? '', /starts with one of/)
    assert.match(checkBranchName('nt-12/add')[0] ?? '', /2 to 5 words/)
    assert.match(checkBranchName('nt-12/add-a-very-long-button-name')[0] ?? '', /2 to 5 words/)
  })

  it('rejects release branches with anything but the version', () => {
    assert.equal(checkBranchName('release/0.2.0').length, 1)
    assert.equal(checkBranchName('release/v0.2').length, 1)
  })
})

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
    for (const message of ['Merge branch nt-12/add-button', 'Revert "feat: add x"', 'fixup! feat: add x']) {
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
