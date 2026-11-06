import { matchScore } from '@/lib/utils'

import { type CommandMenuGroup } from './command-menu.types'

/**
 * The groups to show for `query`: with nothing typed, every group, after the recent items if there are any; once
 * something is typed, only the commands that match, best first within each group, and recent items left out, since
 * they're already in their own groups. Groups with no match drop out.
 */
export function visibleGroups(
  groups: readonly CommandMenuGroup[],
  query: string,
  recent?: CommandMenuGroup,
): CommandMenuGroup[] {
  if (!query.trim()) return recent?.items.length ? [recent, ...groups] : [...groups]

  return groups.flatMap((group) => {
    const items = group.items
      .map((item) => ({ item, score: matchScore(item.label, query, item.keywords) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
    return items.length ? [{ ...group, items }] : []
  })
}
