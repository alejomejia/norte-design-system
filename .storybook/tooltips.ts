/** Elements a tooltip can belong to. */
const CONTROL_SELECTOR = 'a, button, input, label, select, [role="tab"]'

/**
 * Whether an element shows words of its own, which a tooltip would only repeat: text with a letter or a digit. A lone
 * symbol, like the `*` of a required prop, isn't a label.
 */
function showsLabel(element: Element) {
  // `innerText`, not `textContent`: the visible words only, so an icon button's hidden label doesn't count.
  // biome-ignore lint/performance/useDomNodeTextContent: visible text is the point here
  const text = element instanceof HTMLElement ? element.innerText : ''
  return /[\p{L}\p{N}]/u.test(text)
}

/** Hides a Storybook tooltip that opened on a control with its own label: the one under the pointer, or in focus. */
function hideRedundantTooltip(tooltip: HTMLElement) {
  const hovered = [...document.querySelectorAll(':hover')].at(-1)
  const control = hovered?.closest(CONTROL_SELECTOR) ?? document.querySelector(':focus-visible')
  if (control && showsLabel(control)) tooltip.style.display = 'none'
}

/**
 * Keeps tooltips for controls with nothing else to read, like icon buttons. Storybook gives each of its buttons a
 * tooltip with the button's name, and a few elements a `title`, so words the control already shows popped up again on
 * every hover. Those tooltips are hidden and those titles removed; screen readers keep each control's name.
 * @param titleScope - Where `title` attributes are Storybook's own. The docs pages also render stories, whose titles
 * stay.
 */
export function limitTooltips(titleScope = 'body') {
  function apply() {
    for (const tooltip of document.querySelectorAll<HTMLElement>('.react-aria-Tooltip:not([data-nt-checked])')) {
      tooltip.dataset.ntChecked = ''
      hideRedundantTooltip(tooltip)
    }
    for (const element of document.querySelectorAll(`:is(${titleScope}) [title]`)) {
      if (showsLabel(element)) element.removeAttribute('title')
    }
  }

  apply()
  // Removing a title or marking a tooltip leaves nothing more to change, so it stops there.
  new MutationObserver(apply).observe(document.body, { subtree: true, childList: true, attributeFilter: ['title'] })
}
