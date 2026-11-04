import { describe, expect, it } from 'vitest'

import { checkCommitMessage } from './git-rules.ts'

describe('checkCommitMessage', () => {
  it('accepts conventional commits, with or without a scope and a body', () => {
    for (const message of [
      'feat(button): add a loading state',
      'chore: scaffold React design system with Storybook',
      'fix(menu)!: close on escape\n\nThe menu stayed open when focus was inside a submenu.',
      'chore(release): v0.2.0\n',
    ]) {
      expect(checkCommitMessage(message), message).toEqual([])
    }
  })

  it('ignores the comment lines git adds', () => {
    expect(checkCommitMessage('docs: explain changesets\n# Please enter the commit message')).toEqual([])
  })

  it('lets the commits git writes itself through', () => {
    for (const message of ["Merge branch 'dev'", 'Revert "feat: add x"', 'fixup! feat: add x']) {
      expect(checkCommitMessage(message), message).toEqual([])
    }
  })

  it('rejects messages without a type', () => {
    expect(checkCommitMessage('Add a loading state')).toHaveLength(1)
  })

  it('rejects unknown types and scopes that are not kebab-case', () => {
    expect(checkCommitMessage('feature: add x')[0] ?? '').toMatch(/type is one of/)
    expect(checkCommitMessage('feat(Button): add x')[0] ?? '').toMatch(/scope/)
  })

  it('checks the summary', () => {
    expect(checkCommitMessage('feat: Add x')[0] ?? '').toMatch(/lowercase/)
    expect(checkCommitMessage('feat: add x.')[0] ?? '').toMatch(/period/)
    expect(checkCommitMessage(`feat: ${'a'.repeat(70)}`)[0] ?? '').toMatch(/72 characters/)
  })

  it('needs an empty line before the body', () => {
    expect(checkCommitMessage('feat: add x\nbecause y')[0] ?? '').toMatch(/empty line/)
  })

  it('rejects AI attribution', () => {
    expect(checkCommitMessage('feat: add x\n\nCo-Authored-By: Claude <noreply@anthropic.com>')).toHaveLength(1)
    expect(checkCommitMessage('feat: add x\n\nGenerated with Claude Code')).toHaveLength(1)
  })

  it('allows a human co-author', () => {
    expect(checkCommitMessage('feat: add x\n\nCo-Authored-By: Ana Gómez <ana@example.com>')).toEqual([])
  })
})
