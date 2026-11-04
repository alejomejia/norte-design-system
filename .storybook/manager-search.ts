/**
 * The sidebar search (`manager-styles/sidebar-search.css`), showing results only for a query.
 *
 * Storybook opens its search menu as soon as the field gets focus, and while the field is empty the menu lists recently
 * opened pages in place of the tree. That list goes: the menu stays closed while the field is empty. React never hears
 * about focus or arrow keys in the empty field, which open the menu, and a menu left open by an emptied field
 * (Backspace, Escape, the clear button) is closed by blurring and focusing the field again, which Storybook treats as
 * leaving the search. Hiding the list with CSS alone isn't enough: it can hold the same page twice, and React then
 * leaves those rows behind among the results of the next query.
 *
 * Storybook lists a component's docs page under the name "Docs", with the component's name last in its path, and marks
 * every letter its fuzzy search matched, scattered across words. A watcher flags those docs rows, so the CSS can make
 * the component's name their title, and highlights where the query appears as typed instead. The highlight uses the CSS
 * Custom Highlight API, which paints ranges of text without touching the elements React renders.
 */

/** The name Storybook gives a component's docs page. */
const DOCS_NAME = 'Docs'

/** The highlight `sidebar-search.css` paints with `::highlight()`. */
const HIGHLIGHT_NAME = 'nt-search-match'

/** Keys that open Storybook's search menu from the field. */
const OPENING_KEYS = ['ArrowDown', 'ArrowUp']

function getSearchField() {
  return document.querySelector<HTMLInputElement>('#storybook-explorer-searchfield')
}

function isEmptySearchField(target: EventTarget | null): target is HTMLInputElement {
  return target instanceof HTMLInputElement && target.id === 'storybook-explorer-searchfield' && !target.value
}

/** The words of the search field, lowercased, without repeats. */
function getQueryWords() {
  const query = getSearchField()?.value ?? ''
  return [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))]
}

/** Closes the search menu if the field was emptied while it was open. */
function closeEmptyMenu() {
  const field = getSearchField()
  if (!field || field.value || field.closest('[aria-expanded]')?.getAttribute('aria-expanded') !== 'true') return
  if (document.activeElement !== field) return

  // The blur closes the menu. The focus comes back without telling React, so it doesn't open it again.
  field.blur()
  field.focus()
}

/** The text node and offset at `offset` of `nodes` read as one string. An end offset may sit at a node's end. */
function locate(nodes: readonly Text[], offset: number, isEnd: boolean): [Text, number] {
  let start = 0
  for (const node of nodes) {
    const end = start + node.length
    if (offset < end || (isEnd && offset === end)) return [node, offset - start]
    start = end
  }
  throw new RangeError(`Offset ${offset} is past the end of the text`)
}

/**
 * The ranges of `element`'s text where any of `words` appears, ignoring case. Storybook splits the text into spans
 * around its own marks, so it's read across them.
 */
function findMatches(element: Element, words: readonly string[]) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text)
  const text = nodes
    .map((node) => node.data)
    .join('')
    .toLowerCase()

  const ranges: Range[] = []
  for (const word of words) {
    for (let index = text.indexOf(word); index !== -1; index = text.indexOf(word, index + word.length)) {
      const range = new Range()
      range.setStart(...locate(nodes, index, false))
      range.setEnd(...locate(nodes, index + word.length, true))
      ranges.push(range)
    }
  }
  return ranges
}

function applySearchResults() {
  closeEmptyMenu()

  const words = getQueryWords()
  const ranges: Range[] = []

  for (const row of document.querySelectorAll('#storybook-explorer-menu .search-result-item')) {
    const [title, path] = row.querySelector('.search-result-item--label')?.children ?? []
    if (!title || !path) continue
    row.toggleAttribute('data-nt-docs', title.textContent === DOCS_NAME)

    // Each path segment on its own: the slashes between them are drawn by CSS, so their texts touch.
    for (const segment of [title, ...path.children]) ranges.push(...findMatches(segment, words))
  }

  CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges))
}

/** Applies the changes now and whenever the query or the results change. */
export function watchSearchResults() {
  let frame = 0
  function schedule() {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(applySearchResults)
  }

  // Capturing listeners on the window run before React's, which listens on its root.
  window.addEventListener(
    'focusin',
    (event) => {
      if (isEmptySearchField(event.target)) event.stopPropagation()
    },
    true,
  )
  window.addEventListener(
    'keydown',
    (event) => {
      if (isEmptySearchField(event.target) && OPENING_KEYS.includes(event.key)) event.stopPropagation()
    },
    true,
  )

  applySearchResults()
  // The rows' flag is an attribute the observer ignores, so applying never triggers it again. The menu opening or
  // closing changes `aria-expanded` on the field's wrapper.
  new MutationObserver((records) => {
    const search = document.getElementById('storybook-explorer-menu')?.parentElement
    if (records.some((record) => search?.contains(record.target))) schedule()
  }).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributeFilter: ['aria-expanded'],
  })
  // A new query may keep the same rows and marks, so typing is a change too.
  document.addEventListener('input', (event) => {
    if (event.target instanceof HTMLInputElement && event.target.id === 'storybook-explorer-searchfield') schedule()
  })
}
