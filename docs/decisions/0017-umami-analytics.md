# 0017. Umami for visitor analytics

**Status:** Accepted · 2026-11-11

## Context

The handbook is published at `norte-design-system.alejandromejia.dev`, and a demo app built on the package at
`norte-app.alejandromejia.dev`. Both are a portfolio showcase: what matters is whether anyone visits, where they came
from and which components they open, not funnels or user profiles.

- **Umami:** a tracker of about 2 KB, no cookies and no personal data, so no consent banner. Free on Umami Cloud, or
  self-hosted. The author already uses it for alejandromejia.dev, so every site shares one dashboard.
- **The host's analytics** (Vercel, Cloudflare): no script to add, but tied to a host, and the sites run on a VPS.
- **Google Analytics:** cookies and a consent banner, for far more than a showcase needs.

Storybook keeps the open story in the URL's query (`?path=/story/button--primary`) and rewrites it when a control or a
toolbar setting changes (`&args=`, `&globals=`). Umami counts a page view on every history change, and its Pages report
reads only the path: out of the box, every visit lands on `/`, once per control the visitor touches.

## Decision

- **The published Storybook loads Umami's tracker** in the manager's head (`managerHead` in `.storybook/main.ts`, its
  tag from `analytics-script.ts`), never in the preview's iframe, which would count every visit twice under
  `iframe.html` URLs.
- **Production builds load it, `pnpm dev` never does,** and `data-domains` keeps any copy of the build away from the
  published domain (a local preview, a mirror) from counting.
- **The website id lives in the code,** not in an environment variable: it's public anyway, in every visitor's copy of
  the page, and the build needs no setup on the server.
- **One page view per story:** Umami's before-send hook (`.storybook/analytics.ts`) gives each event the open story as
  its URL (`/story/button--primary`) and drops page views that don't change the story.
- **Visitors who ask not to be tracked aren't** (`data-do-not-track`).

## Consequences

- Umami's dashboard lists the stories and docs pages people open, and the sites that sent them.
- Ad blockers hide some visits: the numbers are a floor, not a count.
- Umami's servers don't check where an event comes from: anyone can send events under the id, by copying the tag
  without `data-domains` or posting to the API. Reports filtered by Hostname leave those out; nothing keeps them out of
  the raw data.
- **Cost:** the hook depends on Storybook keeping the story in `?path=`. A Storybook upgrade that changes its URLs
  breaks the Pages report (not the site), and `analytics.test.ts` only covers the URLs as they are today.

## Revisit when

The showcase needs more than visits (an experiment, a funnel), or Umami's tracker changes how it calls `before-send`.
