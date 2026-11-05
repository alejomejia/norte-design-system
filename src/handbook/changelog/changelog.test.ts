import { describe, expect, it } from 'vitest'

import { biggestBump, componentDocs, nextVersion, parseChangelog, parseChangeset } from './changelog'

const CHANGELOG = `# Changelog

## 0.2.0

### Minor Changes

- 1b5cc4a: Add \`Icon\`, which draws one icon of the set.

  It takes the color of the text around it.

- 62a32f0: Add \`ButtonGroup\`.

### Patch Changes

- Fix the focus ring of \`Button\`.

## 0.1.0

### Minor Changes

- 352e87a: Add \`Button\`.
`

describe('parseChangelog', () => {
  it('reads every version, newest first', () => {
    expect(parseChangelog(CHANGELOG).map(({ version }) => version)).toEqual(['0.2.0', '0.1.0'])
  })

  it('gives each note its bump and commit', () => {
    const [latest] = parseChangelog(CHANGELOG)
    expect(latest?.entries.map(({ bump, commit }) => [bump, commit])).toEqual([
      ['minor', '1b5cc4a'],
      ['minor', '62a32f0'],
      ['patch', undefined],
    ])
  })

  it('keeps the paragraphs of a note, without their indent', () => {
    const [latest] = parseChangelog(CHANGELOG)
    expect(latest?.entries[0]?.text).toBe(
      'Add `Icon`, which draws one icon of the set.\n\nIt takes the color of the text around it.',
    )
  })

  it('reads nothing from an empty changelog', () => {
    expect(parseChangelog('# Changelog\n')).toEqual([])
  })
})

describe('parseChangeset', () => {
  it('reads the bump and the note', () => {
    expect(parseChangeset("---\n'norte-design-system': minor\n---\n\nAdd `Button`.\n")).toEqual({
      bump: 'minor',
      text: 'Add `Button`.',
    })
  })

  it('throws on a changeset without a bump', () => {
    expect(() => parseChangeset('Add `Button`.')).toThrow()
  })
})

describe('biggestBump', () => {
  it('picks the biggest bump of the notes', () => {
    expect(
      biggestBump([
        { bump: 'patch', text: '' },
        { bump: 'minor', text: '' },
      ]),
    ).toBe('minor')
  })

  it('gives nothing without notes', () => {
    expect(biggestBump([])).toBeUndefined()
  })
})

describe('nextVersion', () => {
  it.each([
    ['0.1.3', 'patch', '0.1.4'],
    ['0.1.3', 'minor', '0.2.0'],
    ['0.1.3', 'major', '1.0.0'],
  ] as const)('takes %s with a %s to %s', (version, bump, expected) => {
    expect(nextVersion(version, bump)).toBe(expected)
  })
})

describe('componentDocs', () => {
  it("links each component's name to its docs page", () => {
    expect(
      componentDocs({
        '/src/components/icon-button/icon-button.stories.tsx': "const meta = { title: 'Elements/Actions/Icon button' }",
        '/src/components/button/button.stories.tsx': "const meta = { title: 'Elements/Actions/Button' }",
      }),
    ).toEqual({
      IconButton: '?path=/docs/elements-actions-icon-button--docs',
      Button: '?path=/docs/elements-actions-button--docs',
    })
  })
})
