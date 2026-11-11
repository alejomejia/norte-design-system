/**
 * A link to Norte's repository at the bottom of the sidebar, a card in GitHub's colors (`manager-styles/source-link.css`)
 * so readers can go from the handbook to the code behind it. Storybook has no slot there, and React renders the sidebar
 * anew on some navigations, so a watcher adds the card to each sidebar that lacks it.
 *
 * It opens in a new tab with `rel="noopener"` and not `noreferrer`: GitHub's traffic report then lists the handbook
 * among the repository's referring sites. Umami counts the clicks as `github-source` (decision 0017).
 */

const REPOSITORY_URL = 'https://github.com/alejomejia/norte-design-system'
const REPOSITORY_NAME = 'alejomejia/norte-design-system'

const SIDEBAR_ID = 'storybook-sidebar-region'
const DOCK_CLASS = 'nt-source'

/** GitHub's mark, from Octicons (`mark-github`, MIT). */
const GITHUB_MARK =
  'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z'

const SOURCE_LINK = `<a class="nt-source__link" href="${REPOSITORY_URL}" target="_blank" rel="noopener" data-umami-event="github-source"><svg class="nt-source__mark" viewBox="0 0 16 16" aria-hidden="true"><path d="${GITHUB_MARK}" /></svg><span class="nt-source__text"><span class="nt-source__title">Source on GitHub</span><span class="nt-source__repo">${REPOSITORY_NAME}</span></span><span class="nt-source__arrow" data-icon="arrow-up-right" aria-hidden="true"></span><span class="sb-sr-only">(opens in a new tab)</span></a>`

function addSourceLink() {
  const sidebar = document.getElementById(SIDEBAR_ID)
  if (!sidebar || sidebar.querySelector(`:scope > .${DOCK_CLASS}`)) return
  const dock = document.createElement('div')
  dock.className = DOCK_CLASS
  dock.innerHTML = SOURCE_LINK
  sidebar.append(dock)
}

/** Keeps the repository's card at the bottom of the sidebar. Client-only. */
export function watchSourceLink() {
  addSourceLink()
  new MutationObserver(addSourceLink).observe(document.body, { childList: true, subtree: true })
}
