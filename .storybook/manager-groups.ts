/**
 * The sidebar's groups (Actions, Form controls, Overlays…) start open, so a component is one click away, not two.
 *
 * Storybook has no setting for it: it opens only the sections and the path to the page on screen, and keeps what's open
 * inside React. So a watcher clicks each group open the first time it shows up in a tree. After that the reader is in
 * charge: a group they close, by click or keyboard, stays closed. A new tree (the search cleared, the page reloaded)
 * starts open again. Components stay closed: opening them would list every story.
 *
 * Storybook scrolls the sidebar to a group as it opens it, so the watcher puts the scroll back.
 */

const TREE_ID = 'storybook-explorer-tree'

/** The tree the groups were opened in, and the groups it has shown so far. */
let currentTree: HTMLElement | null = null
let seenGroups = new Set<string>()

/** Every element above the tree with its scroll position, to put it back. */
export function getScrollPositions(element: HTMLElement) {
  const positions: [HTMLElement, number][] = []
  for (let node = element.parentElement; node; node = node.parentElement) positions.push([node, node.scrollTop])
  return positions
}

function openNewGroups() {
  const tree = document.getElementById(TREE_ID)
  if (tree !== currentTree) {
    currentTree = tree
    seenGroups = new Set()
  }
  if (!tree) return

  const groups = [...tree.querySelectorAll<HTMLElement>('[data-nodetype="group"]')].filter(
    (group) => group.dataset.itemId && !seenGroups.has(group.dataset.itemId),
  )
  if (groups.length === 0) return

  const positions = getScrollPositions(tree)
  for (const group of groups) {
    seenGroups.add(group.dataset.itemId as string)
    group.querySelector<HTMLButtonElement>(':scope > button[aria-expanded="false"]')?.click()
  }
  for (const [node, top] of positions) node.scrollTop = top
}

/** Opens every group of the sidebar the first time it shows up. Groups inside groups open as they appear. */
export function watchSidebarGroups() {
  openNewGroups()
  new MutationObserver(openNewGroups).observe(document.body, { childList: true, subtree: true })
}
