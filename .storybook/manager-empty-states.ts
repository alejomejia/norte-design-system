/**
 * Empty states of the addon panel: an icon, a title and a line of explanation wherever a tab has nothing to show, in one
 * look (`manager-styles/panel.css`). Storybook shows nothing at all in an empty Actions tab, and its own messages in the
 * other tabs differ from tab to tab and carry no hooks to restyle them, so a watcher puts this one in their place and
 * hides Storybook's.
 */
import { FORCE_REMOUNT } from 'storybook/internal/core-events'

type EmptyState = {
  /** A Lucide icon, named in `manager-styles/icons.css`. */
  icon: string
  title: string
  description: string
  /** A button under the description. */
  action?: { label: string; onClick: () => void }
}

/** What the empty states need from the manager: the open story, and a way to tell the preview to run its play. */
type Manager = {
  getCurrentStoryData(): { id: string; tags?: string[] } | undefined
  emit(event: string, data: unknown): void
}

type Target = { host: Element; replaced?: Element }

type EmptyStateRule = EmptyState & {
  /** Another state for the open story, when it calls for one. */
  stateFor?(manager: Manager): EmptyState | undefined
  /**
   * The element the empty state goes in while the tab is empty, and Storybook's own message to hide, if any. `null`
   * while the tab has something to show.
   */
  find(panel: Element): Target | null
}

/** The open tab of the addon panel. React Aria ends its id with the addon's key. */
function getPanel(key: string) {
  return document.querySelector(`#storybook-panel-root > [role='tabpanel'][id$='-tabpanel-${key}']`)
}

/**
 * Storybook's message in an Accessibility list with no results: an element holding only that text. The empty state goes
 * in the list's own panel, under the lists' header.
 */
function findAccessibilityMessage(panel: Element, text: string): Target | null {
  const message = [...panel.querySelectorAll("[role='tabpanel'] div")].find(
    (element) => element.childElementCount === 0 && element.textContent === text,
  )
  const host = message?.closest("[role='tabpanel']")
  return message && host ? { host, replaced: message } : null
}

const RULES: Readonly<Record<string, EmptyStateRule>> = {
  // The log of actions, empty until the story fires an event.
  'storybook/actions/panel': {
    icon: 'mouse-pointer-click',
    title: 'No actions yet',
    description: 'Events the component fires, like a click or a change, show up here as you use the story.',
    find: (panel) =>
      panel.querySelector('[data-radix-scroll-area-content]')?.childElementCount ? null : { host: panel },
  },
  // A story without a play function, or one whose play hasn't run: plays run only when asked (`manual-play.ts`).
  // Storybook's message is the tab's only link, to its docs.
  'storybook/interactions/panel': {
    icon: 'circle-play',
    title: 'No interactions',
    description: 'Stories with a play function show each step it takes here, with its result.',
    stateFor(manager) {
      const story = manager.getCurrentStoryData()
      if (!story?.tags?.includes('play-fn')) return undefined
      return {
        icon: 'circle-play',
        title: 'Interactions ready',
        description: "This story's interactions run when you ask: each step shows here, with its result.",
        // The event the panel's own Rerun sends.
        action: { label: 'Run interactions', onClick: () => manager.emit(FORCE_REMOUNT, { storyId: story.id }) },
      }
    },
    find(panel) {
      const replaced = panel.querySelector("a[target='_blank']")?.closest('div:has(> div > div > a)')
      return replaced ? { host: panel, replaced } : null
    },
  },
}

/** The Accessibility tab's three lists, each with Storybook's message when empty. */
const ACCESSIBILITY_STATES: readonly (EmptyState & { message: string })[] = [
  {
    message: 'No accessibility violations found.',
    icon: 'shield-check',
    title: 'No violations',
    description: 'The automated check found no accessibility issues in this story. Passes lists the rules it checked.',
  },
  {
    message: 'No passing accessibility checks found.',
    icon: 'shield',
    title: 'No passing checks',
    description: 'None of the automated rules applied to this story.',
  },
  {
    message: 'No inconclusive accessibility checks found.',
    icon: 'circle-check',
    title: 'Nothing to review',
    description: 'No check needs a person to confirm its result in this story.',
  },
]

function createEmptyState({ icon, title, description, action }: EmptyState) {
  const media = document.createElement('span')
  media.className = 'nt-empty__icon'
  media.dataset.icon = icon

  const heading = document.createElement('p')
  heading.className = 'nt-empty__title'
  heading.textContent = title

  const text = document.createElement('p')
  text.className = 'nt-empty__description'
  text.textContent = description

  const empty = document.createElement('div')
  empty.className = 'nt-empty'
  empty.dataset.title = title
  empty.append(media, heading, text)

  if (action) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'nt-empty__action'
    button.textContent = action.label
    button.addEventListener('click', action.onClick)
    empty.append(button)
  }
  return empty
}

/**
 * Shows `state` in the target's host, once, or no empty state at all without a target. Any other empty state in the
 * panel goes: React may keep the element an old one was added to while the tab fills up.
 */
function render(panel: Element, state?: EmptyState, target?: Target | null) {
  for (const empty of panel.querySelectorAll<HTMLElement>('.nt-empty')) {
    // Another host, or another state for the same one (the next story has a play function, this one didn't).
    if (empty.parentElement !== target?.host || empty.dataset.title !== state?.title) empty.remove()
  }
  if (!state || !target) return

  target.replaced?.setAttribute('data-nt-replaced', '')
  if (!target.host.querySelector(':scope > .nt-empty')) target.host.append(createEmptyState(state))
}

function applyEmptyStates(manager: Manager) {
  for (const [key, rule] of Object.entries(RULES)) {
    const panel = getPanel(key)
    if (panel) render(panel, rule.stateFor?.(manager) ?? rule, rule.find(panel))
  }

  const accessibility = getPanel('storybook/a11y/panel')
  if (!accessibility) return
  const state = ACCESSIBILITY_STATES.find(({ message }) => findAccessibilityMessage(accessibility, message))
  render(accessibility, state, state && findAccessibilityMessage(accessibility, state.message))
}

/** Applies the empty states now and after every change Storybook makes to the UI, like opening another tab. */
export function watchEmptyStates(manager: Manager) {
  applyEmptyStates(manager)
  // Adding an empty state triggers the observer again, but finds it already there, so it stops there.
  new MutationObserver(() => applyEmptyStates(manager)).observe(document.body, {
    subtree: true,
    childList: true,
    attributeFilter: ['id'],
  })
}
