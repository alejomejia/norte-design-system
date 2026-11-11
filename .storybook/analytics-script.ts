/**
 * The Umami tracker's tag for the published Storybook (decision 0017), added to the manager's head by `main.ts`. Runs at
 * build time, in Node: the hook it names lives in `analytics.ts`, in the manager.
 */

/**
 * Norte's website in Umami Cloud. Not a secret: every visitor sees it in the page's source. What keeps other sites from
 * counting under it is `data-domains` (the tracker) and the Hostname filter (the dashboard), see decision 0017.
 */
const WEBSITE_ID = 'fd9eef6b-0d6a-4804-af4d-3dfa43449850'

/** The only host whose visits count: a local or preview build of the same files sends nothing. */
export const ANALYTICS_DOMAIN = 'norte-design-system.alejandromejia.dev'

/** The global function Umami calls with everything it's about to send (its `data-before-send`). */
export const BEFORE_SEND = 'norteBeforeSend'

/**
 * The tracker's `<script>` tag for the manager's head. It counts visits only on `ANALYTICS_DOMAIN` and skips visitors
 * who ask not to be tracked (Do Not Track).
 */
export function analyticsScript(): string {
  return `<script defer src="https://cloud.umami.is/script.js" data-website-id="${WEBSITE_ID}" data-domains="${ANALYTICS_DOMAIN}" data-before-send="${BEFORE_SEND}" data-do-not-track="true"></script>`
}
