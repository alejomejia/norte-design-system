import { describe, expect, it } from 'vitest'

import { type CommandMenuGroup } from './command-menu.types'
import { visibleGroups } from './command-menu.utils'

const GROUPS: CommandMenuGroup[] = [
  {
    label: 'Files',
    items: [
      { value: 'brief', label: 'briefs/q3-pricing.md' },
      { value: 'report', label: 'reports/pricing-q3.md' },
    ],
  },
  {
    label: 'Run #128',
    items: [
      { value: 'share', label: 'Share run', keywords: ['invite'] },
      { value: 'reprice', label: 'Compare prices again' },
    ],
  },
]

const RECENT: CommandMenuGroup = { label: 'Recent', items: [{ value: 'brief', label: 'briefs/q3-pricing.md' }] }

function labels(groups: CommandMenuGroup[]) {
  return groups.map((group) => [group.label, group.items.map((item) => item.value)])
}

describe('visibleGroups', () => {
  it('shows recent items first while nothing is typed', () => {
    expect(labels(visibleGroups(GROUPS, ' ', RECENT))).toEqual([
      ['Recent', ['brief']],
      ['Files', ['brief', 'report']],
      ['Run #128', ['share', 'reprice']],
    ])
  })

  it('leaves out an empty recent group', () => {
    expect(visibleGroups(GROUPS, '', { label: 'Recent', items: [] })).toHaveLength(2)
  })

  it('keeps only matches, best first, and drops recent items and empty groups', () => {
    expect(labels(visibleGroups(GROUPS, 'pric', RECENT))).toEqual([
      ['Files', ['brief', 'report']],
      ['Run #128', ['reprice']],
    ])
    expect(labels(visibleGroups(GROUPS, 'invite', RECENT))).toEqual([['Run #128', ['share']]])
  })

  it('returns nothing when nothing matches', () => {
    expect(visibleGroups(GROUPS, 'invoices', RECENT)).toEqual([])
  })
})
