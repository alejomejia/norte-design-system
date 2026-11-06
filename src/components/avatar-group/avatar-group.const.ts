/** How many circles a group shows by default, the "+N" included, so its width never changes. */
export const AVATAR_GROUP_MAX = 4

/** Names listed the English way: "Lucas Moreau, Amara Diallo, and Jonas Berg". */
const LIST = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

/** What screen readers hear, and the "+N" tooltip shows, as functions of the count and the names, to translate them. */
export const AVATAR_GROUP_LABELS = {
  /** The group's name. */
  group: (count: number) => (count === 1 ? '1 person' : `${count} people`),
  /** The "+N" button's name: who the hidden avatars are. */
  more: (names: string[]) => `${names.length} more: ${LIST.format(names)}`,
  /** The "+N" tooltip: the hidden names, one list. */
  moreTooltip: (names: string[]) => LIST.format(names),
}
