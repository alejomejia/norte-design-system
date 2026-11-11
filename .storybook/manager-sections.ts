/**
 * The sidebar's sections (Handbook, Foundations, Elements…) fold with the chevron at the end of their row, and the
 * sidebar remembers which ones are folded, in localStorage, across reloads. Every section starts open.
 *
 * Storybook keeps what's open inside React and forgets it on reload. So a click on a section's chevron is written down,
 * and when a tree shows up, the folded sections are folded again by clicking their chevrons, as the reader would. A
 * section holding the page on screen stays open, so a reload never hides where the reader is.
 */
import { getScrollPositions } from './manager-groups'

const TREE_ID = 'storybook-explorer-tree'

/** Where the folded sections are kept: a JSON list of their ids (`foundations`, `helpers`). */
const STORAGE_KEY = 'norte.sidebar.folded-sections'

/** A section's button: Storybook's, holding the chevron and the label. */
const TOGGLE = 'button[data-action="collapse-root"]'

/** The tree the folded sections were last folded in. */
let restoredTree: HTMLElement | null = null

/** The ids of the folded sections, or none if the storage is empty, unreadable or blocked. */
export function readFolded(storage: Pick<Storage, 'getItem'>): Set<string> {
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]')
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

function writeFolded(folded: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...folded]))
  } catch {
    // Storage blocked or full: the sidebar just forgets, as Storybook does.
  }
}

/** Writes a section down as folded or open when its chevron is clicked, before Storybook handles the click. */
function rememberToggle(event: MouseEvent) {
  const toggle = event.target instanceof Element ? event.target.closest(TOGGLE) : null
  const id = toggle?.closest<HTMLElement>(`#${TREE_ID} .sidebar-subheading`)?.dataset.itemId
  if (!toggle || !id) return

  const folded = readFolded(localStorage)
  // The click hasn't reached Storybook yet, so `aria-expanded` still says how the section was before it.
  if (toggle.getAttribute('aria-expanded') === 'true') folded.add(id)
  else folded.delete(id)
  writeFolded(folded)
}

/** Folds again, in a new tree, the sections the reader had folded, except the one holding the page on screen. */
function restoreFolded() {
  const tree = document.getElementById(TREE_ID)
  if (!tree || tree === restoredTree) return
  const sections = [...tree.querySelectorAll<HTMLElement>('.sidebar-subheading[data-item-id]')]
  if (sections.length === 0) return
  restoredTree = tree

  const folded = readFolded(localStorage)
  if (folded.size === 0) return
  const current = tree.querySelector<HTMLElement>('[data-selected="true"]')?.dataset.itemId
  const positions = getScrollPositions(tree)
  for (const section of sections) {
    const id = section.dataset.itemId as string
    if (!folded.has(id) || current?.startsWith(`${id}-`)) continue
    section.querySelector<HTMLButtonElement>(`${TOGGLE}[aria-expanded="true"]`)?.click()
  }
  for (const [node, top] of positions) node.scrollTop = top
}

/** Remembers which sections the reader folds, and folds them again in every new tree. */
export function watchSidebarSections() {
  document.addEventListener('click', rememberToggle, true)
  restoreFolded()
  new MutationObserver(restoreFolded).observe(document.body, { childList: true, subtree: true })
}
