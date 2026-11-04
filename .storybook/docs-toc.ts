/**
 * Where a heading becomes current: this far below the top of the screen, so a section takes over as soon as its heading
 * reaches the top part of the screen, and a heading scrolled to from "On this page" (Storybook puts it 40px down) is
 * the current one.
 */
const ACTIVATION_LINE = 96

/**
 * Keeps the current heading of "On this page" in sync with the scroll, on every frame. Storybook's table of contents
 * (tocbot) builds the list and scrolls on click, but its own tracking is turned off in `preview.ts`: it only updated once
 * scrolling stopped, and never reached the last sections of a page, whose headings can't scroll up to the top.
 *
 * Here the current heading is the last one above the activation line. Over the last screen of scrolling, the line moves
 * down to the bottom of the screen, so the last sections become current one by one as the page reaches its end. The bar
 * on the track follows the current link (`docs-styles/toc.css`).
 */
export function watchTableOfContents() {
  let frame = 0

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update)
  }

  /** The activation line, moved down over the last screen of scrolling (or the whole scroll, on a short page). */
  function activationLine() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    const left = Math.max(0, scrollable - window.scrollY)
    const span = Math.min(window.innerHeight, scrollable)
    if (span <= 0 || left >= span) return ACTIVATION_LINE
    return ACTIVATION_LINE + (window.innerHeight - ACTIVATION_LINE) * (1 - left / span)
  }

  function update() {
    frame = 0
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc-wrapper .toc-link')]
    if (links.length === 0) return

    const line = activationLine()
    let current = 0
    links.forEach((link, index) => {
      const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)))
      if (heading && heading.getBoundingClientRect().top <= line) current = index
    })

    links.forEach((link, index) => {
      link.classList.toggle('is-active-link', index === current)
      link.parentElement?.classList.toggle('is-active-li', index === current)
    })
  }

  document.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  // A new docs page: Storybook builds its list a moment after the page renders.
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true })
}
