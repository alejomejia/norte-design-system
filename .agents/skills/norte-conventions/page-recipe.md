# Page recipe

How a whole screen of the workspace is built in Norte, learned building Sign in (`src/handbook/pages/sign-in/`, the
reference for everything below). Pages show the layers working together; the Next.js app rebuilds them later from the
package, so write them as if they were already there.

## Where it lives

```
src/handbook/pages/<name>/
  index.tsx              the page: its layout, and any provider it needs (ToastProvider)
  <name>-form.tsx …      its regions, one exported function each (the form, the steps, a side panel)
  <name>.const.ts        every word on it (`<NAME>_COPY`), demo values, timings, any replayed timeline
  <name>.hooks.ts        its hooks: a pretend server, countdowns, a replay, focus between steps
  <name>.styles.ts       one `tv` per region, with a top comment on layout, breakpoints and motion
  <name>.types.ts        the unions derived from the consts
  <name>.stories.tsx     one story (below)
```

- **Handbook, not package:** `src/handbook/**` is left out of the build, so a page never ships and needs no changeset
  (a component it changes on the way does). It may use handbook assets (`@/handbook/assets/people/…`) and blocks
  (`Topography`), but its UI comes only from `@/components/*`. If it needs something Norte doesn't have, the piece is
  built (or fixed) first, as its own commit: Sign in made Code field grow an `error` before the page.
- **`'use client'`** on every file with state or effects; the page stays a plain React tree a Next.js route can render.
- **Copy is data:** no string literal in JSX. A pretend backend is effects, not promises: `useAfter(active, delay,
  onDone)` turns a `sending` flag into a reply, and cancels on unmount, so no `wait()` helper lands in `lib/`.
- **Demo values are discoverable:** the one code the pretend server accepts is in the story's description and in the
  toast that says it was sent, so it works in Storybook and in the app.

## The story

A page has **one story, the state it opens on** (Sign in opens on a new account: `args: { defaultMode: 'sign-up' }`).
Its other states are reached by using it, not by more stories:

- `parameters.layout: 'fullscreen'`, `controls: { disable: true }` (the docs page then drops the props table too),
  `docs.story: { inline: false, iframeHeight: 760 }`.
- **The play test walks every state** with the keyboard (errors, each step, success, the way back) and ends where it
  started. It's the page's only test, so it carries all the coverage separate stories would have.
- **The description links to the full page.** The docs' column shows it at a tablet's width, so link the story on its
  own, with an HTML link: Storybook routes a markdown link without a target through its own navigation, which can't
  open `iframe.html`, so nothing happens.

  ```
  <a href="iframe.html?id=pages-workspace-<name>--<story>&viewMode=story" target="_blank" rel="noreferrer">Open the full page in a new tab</a>
  ```

  Paragraphs and links in a description are styled by `.sb-lead` in `.storybook/docs-styles/typography.css`.

## Layout

- **Every width from 320px:** `min-h-dvh` on the page; check 320×568, 375×667, 768×1024, 1024×600, 1280×720, 1440×900
  and 1920×1080. Nothing scrolls sideways, and on laptops nothing scrolls down.
- **A side panel is the window's height, never more:** `lg:sticky lg:top-0 lg:h-dvh`, and what's inside gives up
  height (`min-h-0`, rows of `minmax(0,1fr)`) instead of making the page scroll.
- **A panel that changes with its own width uses a container query** (`@container` on it, `@xl:` inside). A container
  query measures the **content box**: with `xl:px-14`, `@xl` (576px) means a 688px panel, a 1440px window.
- **Bento grids:** rows that share the height are `minmax(0,1fr)` (`grid-rows-1` for one), every cell `min-h-0`; a
  cell that should be as tall as its content in a taller row is `self-start max-h-full`. Cells of different sizes
  (small stats across the top, one big cell, a tall one beside it) read as a bento; equal cells read as a table.
- **What CSS can't switch goes through `useMediaQuery`** (`@/lib/hooks`): a sidebar that starts collapsed below 1280px,
  a breadcrumb that folds below 640px. Two triggers for one dialog, one per width, hide with `max-sm:hidden` and
  `sm:hidden` instead (the run view's Share).
- **Overlaps use `translate`,** never negative margins, so the layout still makes room for the moved piece.

## Motion

- **Steps of a flow:** `AnimatePresence mode="wait"` with a key per step, sliding 8px out (`fast`, `exit`) and in
  (`appear`, `enter`), the direction a `custom` value (back slides the other way). The first step's rows `rise` in
  turn as the page opens; later steps don't.
- **Focus follows the person, not the page:** a step takes focus only when someone moved to it (`useStepFocus`, with
  `preventScroll`). A page that grabs focus on mount jumps the docs page around.
- **A feed that grows at the bottom glides** (`useGlideOnGrow`): it starts lower by what arrived and slides back, on
  `transform` through the Web Animations API with `composite: 'add'`, so bursts read as one scroll. New blocks also
  `animate-rise`.
- **Decorative panels** (a replayed run, a map): `aria-hidden` and `inert`; they play only while on screen
  (`useInViewport`, which also stops them while `display: none` on small screens), hold one still frame under reduced
  motion, and start their clocks when they start playing, not on mount (a background tab would show them ahead).

## Checks

- **Iterate without the browser or the suites:** the user reviews visual work in their own Storybook and changes
  direction often. After each edit, only `pnpm typecheck` and Biome; once the user approves, run `pnpm check` and
  `pnpm test:stories` once, fix, and commit.
- **Measure only what needs numbers,** after approval: load the story in fixed-size iframes from a page on the
  Storybook origin (`iframe.html?id=…`) and read `getBoundingClientRect` and `scrollWidth`/`scrollHeight`, since the
  browser window may not resize.
- **A play test that ends on a step that's still sliding in fails the contrast check** (half-faded text): wait for the
  step's opacity to reach 1 (`settled()` in the Sign in stories).
- **A new folder isn't styled in a running Storybook** until Tailwind rescans: see the styling pitfalls.
