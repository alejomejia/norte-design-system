/**
 * What the published Storybook sends to Umami (decision 0017): the build adds the tracker to the manager's head
 * (`analytics-script.ts`), and this hook rewrites what it sends so each story counts as a page of its own.
 */
import { BEFORE_SEND } from './analytics-script'

/**
 * The page a Storybook URL shows, as a path: `/?path=/story/button--primary&args=size:lg` → `/story/button--primary`.
 * Storybook keeps the open story in the query, and Umami's Pages report reads only the path. `undefined` while the URL
 * names no story yet: Storybook is about to open the first one.
 */
export function storybookPage(href: string): string | undefined {
  return new URL(href).searchParams.get('path') || undefined
}

/** What Umami sends: the fields read here, plus the ones passed through untouched. */
type Payload = { name?: string; url?: string; [key: string]: unknown }

/**
 * Umami's before-send hook: every event gets the open story as its URL, and a page view counts only when the story
 * changes. Umami sends a page view on every history change, and Storybook rewrites its URL whenever a control or a
 * toolbar setting changes (`&args=`, `&globals=`): those would count as views of the same story.
 *
 * The URL is read from the page rather than the payload: Umami reports the URL it saw when it loaded, and Storybook
 * may have opened a story by the time Umami starts.
 */
export function createBeforeSend(getHref: () => string) {
  let lastPage: string | undefined

  return function beforeSend(type: string, payload: Payload): Payload | null {
    if (type !== 'event') return payload
    const page = storybookPage(getHref())
    const isPageView = !payload.name
    if (isPageView) {
      if (!page || page === lastPage) return null
      lastPage = page
    }
    return page ? { ...payload, url: page } : payload
  }
}

/** Hands Umami its before-send hook. Client-only. Without the tracker (a local Storybook), nothing calls it. */
export function watchPageViews() {
  Object.assign(window, { [BEFORE_SEND]: createBeforeSend(() => window.location.href) })
}
