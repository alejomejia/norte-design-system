/**
 * A few strings of the Storybook UI, rewritten. Storybook has no option for them and CSS can't change text, so a watcher
 * puts the new copy back whenever Storybook renders the old one (the search field swaps its placeholder on every focus
 * and blur).
 */
type CopyRule = {
  /** The element holding the text. */
  selector: string
  /** The attribute holding the text. Without it, the element's own text is rewritten. */
  attribute?: string
  /** Storybook's strings. */
  from: readonly string[]
  to: string
}

const COPY_RULES: readonly CopyRule[] = [
  // The search field, idle and focused.
  {
    selector: '#storybook-explorer-searchfield',
    attribute: 'placeholder',
    from: ['Find components', 'Type to find...'],
    to: 'Search',
  },
  // A search with no results.
  { selector: '#storybook-explorer-menu', from: ['No components found'], to: 'No results' },
  { selector: '#storybook-explorer-menu', from: ['Find components by name or path.'], to: 'Try another name or path.' },
  // The settings menu.
  { selector: '#list-item-about', from: ['About your Storybook'], to: 'About Storybook' },
  { selector: '#list-item-documentation', from: ['Documentation'], to: 'Storybook docs' },
  // The Accessibility tab: the checks axe couldn't settle, which a person has to look at, and the link of each rule,
  // which only fixes something on a violation.
  { selector: "#storybook-panel-root [role='tab'][data-key='incomplete']", from: ['Inconclusive'], to: 'Needs review' },
  {
    selector: "#storybook-panel-root :is([id^='details:passes.'], [id^='details:incomplete.'])",
    from: ['Learn how to resolve this violation'],
    to: 'Learn more about this rule',
  },
]

function applyRule(element: Element, { attribute, from, to }: CopyRule) {
  if (attribute) {
    const value = element.getAttribute(attribute)
    if (value !== null && from.includes(value)) element.setAttribute(attribute, to)
    return
  }

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue && from.includes(node.nodeValue.trim())) node.nodeValue = to
  }
}

function applyCopy() {
  for (const rule of COPY_RULES) {
    for (const element of document.querySelectorAll(rule.selector)) applyRule(element, rule)
  }
}

/** Applies the copy now and after every change Storybook makes to the UI. */
export function watchCopy() {
  applyCopy()
  // A rewrite triggers the observer again, but finds nothing left to change, so it stops there.
  new MutationObserver(applyCopy).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributeFilter: ['placeholder'],
  })
}
