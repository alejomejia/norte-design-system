---
name: norte-conventions
description: House conventions for the Norte design system (React 19 + Tailwind v4 + Storybook): file and folder naming, the component pattern, project structure, styling (tokens and roles, 8px grid in rem, brackets as a last resort, no inline CSS), imports, barrels, shared utilities, JSDoc, hooks, performance, accessibility, copy, docs, tests and dependencies, with an rg review checklist. Apply to any change in src/, .storybook/ or scripts/, including Tailwind classes and CSS.
---

# Norte conventions

How code is organized, named and written in Norte. They are the author's house conventions for every project,
adapted where a design system package needs something different (marked **Norte:**). Why the stack is what it is
lives in [`docs/decisions/`](../../../docs/decisions/README.md); how changes reach `dev` and `main` lives in
[`CONTRIBUTING.md`](../../../CONTRIBUTING.md).

Before finishing a change, run the [review checklist](#review-checklist) and `pnpm check`, and fix what they print.

**Building a new component?** Start from the [component recipe](component-recipe.md): the files, the root, the
stories and play tests every component has, and the pitfalls already hit. It replaces reading whole components.

## Naming and files

- **Everything is kebab-case,** folders and files, components included: `prompt-input/`, `use-in-viewport.ts`. The
  component inside is PascalCase (`function PromptInput()`).
- **A component is a folder** with `index.tsx` (the component, its only public entry) plus prefixed siblings:
  - sub-components that render JSX use a dash: `prompt-input-toolbar.tsx`;
  - companions without JSX use a dot: `prompt-input.styles.ts`, `.types.ts`, `.const.ts`, `.hooks.ts`, `.utils.ts`;
  - stories: `prompt-input.stories.tsx`.
- **Every file in the folder repeats its name,** so `Cmd-P "prompt-input"` finds the whole component and nothing else.
- Small handbook blocks and helpers stay one file until they grow.

## Component pattern

- **Function declarations for everything named** (components, hooks, helpers, handlers). Inline callbacks may stay
  arrows. Biome enforces it.
- **Compound components** export `Object.assign(Root, { Item })`, and only that.
- **Styles live in `<name>.styles.ts`,** defined with tailwind-variants (`tv`): variants, slots and compound variants
  in one place, and the props typed from them (decision 0003). Short class strings inside `cn()` stay inline.
- **Constants out of JSX:** magic numbers, durations, option lists and repeated ARIA strings go in `<name>.const.ts`
  (`as const`); types derived from them in `<name>.types.ts`.
- **Every component takes `className`** and merges it last with `cn()` (or the `tv` call), so apps can override it.
- **`'use client'` only on the files that need it** (hooks, refs, events). Presentational components stay usable in
  Server Components.
- **Behavior comes from Base UI** when a component has any (menus, dialogs, tabs, selects…); Norte adds the styling
  through Base UI's data attributes (`data-highlighted:`, `data-disabled:`). Decision 0004.

## Project structure

```
src/
  index.ts          the package's public API: every component and its public types
  components/       one folder per component (what ships)
  lib/utils/        pure, generic helpers, behind the `@/lib/utils` barrel
  lib/hooks/        shared client hooks, behind the `@/lib/hooks` barrel
  lib/motion/       Motion's lazy features and the timing tokens in its units, behind the `@/lib/motion` barrel
  styles/           theme.css (the tokens) and the Storybook stylesheet
  handbook/         Storybook only: pages (MDX), doc blocks, token parser, statuses
.storybook/         Storybook config, UI theme (manager) and docs styles
scripts/            Node scripts (git hooks)
docs/decisions/     one record per decision
```

The rule: **ships in the package → `components/` or `lib/`; only explains the package → `handbook/`.** Handbook
files never ship (they are excluded from the build and from changesets).

**Norte:** the sidebar lists only components that exist. No placeholders for planned ones: an empty "coming soon" page
says less than a short list where every item works.

## Styling

- **Components read roles, never primitives:** `bg-surface`, `text-ink-muted`, `border-line`, `bg-accent`. A primitive
  (`bg-blue-600`) only where no role fits, like a chart scale. Only Norte's names exist: the theme resets Tailwind's
  defaults (decision 0010). There's one theme, so no `dark:` classes.
- **Every length sits on the 8px grid,** plus 1, 2, 4 and 12px, written in **rem**, never px. On Tailwind's spacing
  scale the class number is px ÷ 4: allowed numbers are `0.25`, `0.5`, `1`, `3` and every even number. Round design
  values to the nearest allowed one. Font sizes are the exception: off the grid, but only through `text-*` tokens.
  Hairlines (`border`, `ring-1`, `outline-1`, `*-px`) stay in px.
- **Space between siblings comes from the parent's `gap`** (`gap`, `gap-x`, `gap-y`), never from margins or padding on
  the children (`mt-2`, `-mt-1`, `pb-1`). Padding is a box's own inside; a margin only pushes (`ml-auto`). When rows
  need different spacing, nest a flex or grid with its own gap; when an item must line up with another, align it
  (`items-center`, `items-baseline-last`, a fixed row height like `min-h-8`) instead of nudging it.
- **Square brackets are a last resort.** Use the token, a bare value (`z-60`, `aspect-2/3`, `duration-350`) or the
  `(--var)` shorthand first. Brackets only when none exists, and the value inside still follows the grid.
- **No raw inline CSS.** Static values are classes; runtime values go through `toCSSVars` and are read with the
  shorthand: `className="bg-(--swatch)" style={toCSSVars({ swatch })}`.
- **In `.css` files,** end every line that uses rem with its px value: `0.25rem; /* 4px */`. Plain CSS only where
  Tailwind can't reach (keyframes, the Storybook UI, generated markup).
- **Classes are sorted** by Biome, which reads the theme from `src/styles/index.css`.

## Imports

- **Go up one folder at most.** Same folder: `./`. The parent folder: `../` is fine. Anything further: the `@/` alias
  (`@/*` → `src/*`), never `../../`. Biome enforces it.
- **Norte:** files that run outside Vite don't know the alias (`.storybook/manager.ts`, bundled by Storybook's own
  esbuild, and `scripts/**`, run by plain Node), so they keep to `./` and `../`.
- `cn()` and `toCSSVars()` come from `@/lib/utils`; never import `clsx` or `tailwind-merge` in a component.

## Barrels

A barrel (an `index.ts` that only re-exports) is allowed only as a `lib/` domain's public surface: `lib/utils`
(universal), `lib/hooks` and `lib/motion` (client). Members are light, side-effect free and safe in one runtime; `lib/utils`
imports nothing from `@/`. Code outside the folder imports through the barrel, never a deep path. A component's
`index.tsx` is its implementation, not a barrel. `src/index.ts` is the package's entry, the one exception.

## Shared utilities

If a function knows nothing about the component it sits in, it belongs in `src/lib/utils/<topic>.ts` (`styles.ts`,
`color.ts`, `math.ts`…), exported from the barrel. Move it the moment you write it; don't wait for a second caller.
Never a catch-all `helpers.ts`. Helpers that touch `window` or `document` say **client-only** in their JSDoc.

## JSDoc and comments

Every exported symbol gets a one-line JSDoc; `@example` only when it helps, `@throws` when it throws. Don't restate
TypeScript. Comment the **why** of non-obvious code, briefly. Props get a JSDoc line when their meaning isn't obvious,
since Storybook's props table shows it.

## Hooks and effects

Never suppress the hooks rules. When an effect needs the latest props or state without re-running, wrap that logic in
`useEffectEvent`, called only from inside effects.

## Performance

- **Per-frame or continuous work pauses while off-screen and in hidden tabs** (rAF loops, canvas, video, timers),
  through the shared `useInViewport` hook in `@/lib/hooks`. Mandatory, never an option.
- **Respect reduced motion:** durations come from the tokens (they drop to zero), and continuous effects draw one
  still frame.
- **Animate `transform` and `opacity` only.** Per-frame writes go through refs, never React state.
- **CSS first, Motion for the rest** (decision 0012): hovers, presses and state changes are CSS transitions; exits,
  springs and sequences use Motion's `m` under a lazy `LazyMotion`. Follow the `motion` skill.

## Accessibility

- Color pairs come from roles checked by `src/styles/theme.test.ts` (WCAG 2.2 AA); a new role pair joins that test.
- Every story is an accessibility test (`pnpm test:stories`); a violation fails it.
- Interactive components work with the keyboard and screen readers, usually through Base UI.

## Copy

**Norte:** components don't hard-code user-facing text. Every visible or announced string (a button's "Copy", a
dialog's "Close", a live region's message) is a prop with an English default, so apps can translate it. Handbook
pages and stories are English.

## Docs

**Norte:** a component's Storybook docs page is its README, so there's no README per component folder. Every component
ships in the same change with:

1. a story file with a `Playground` story, one story per variant or state, and the status tag (`ready`, `beta`…);
2. a component description (the meta's `parameters.docs.description.component`), two or three sentences that don't
   repeat what the props table and stories show (the recipe has the rule), and a JSDoc line per non-obvious prop;
3. its place in the sidebar (`storySort` in `.storybook/preview.ts`);
4. its export in `src/index.ts`, and a changeset.

### Stories

- **Playground first,** with every control live. It's the canvas at the top of the docs page, so it shows its code
  (`parameters: { docs: { canvas: { sourceState: 'shown' } } }`); every other story keeps it behind "Show code".
- **One story per variant or state,** with a JSDoc line above it: it's the story's description on the docs page.
- **Don't repeat a prop's default in `args`.** Controls start at each prop's default (`.storybook/default-args.ts`), and
  the code leaves defaults out (`.storybook/story-source.ts`).
- **Overview stories** (sizes, states, variants side by side) lay out with the helpers in `.storybook/preview.css`
  (`sb-row`, `sb-stack`, `sb-box-*`, `sb-panel`, `sb-surface-inverse`), never Tailwind classes: elements that carry only
  helpers are left out of the code, anything else lands in it. They keep only the controls that still apply
  (`parameters.controls.exclude`: the props each item sets itself), and stories that show a behavior keep none
  (`controls: { disable: true }`).
- **Number props are sliders** (`control: { type: 'range', min, max }`); the step follows from the span.
- Props group under Props and `on…` handlers under Events on their own (`.storybook/arg-categories.ts`).

### Handbook pages

- Every page opens with `PageHeader`; sections are `##`, subsections `###` with a one-line description under them.
- Foundation pages render **live tokens** through the blocks in `src/handbook/blocks/`, never a value typed by hand.
- Every token is a `CopyToken` chip that copies its **variable** (`var(--color-ink)`), never the raw value. A new
  token gets its card or row on its foundation page in the same change.
- **Links that leave Storybook open in a new tab,** with an arrow and "(opens in a new tab)" for screen readers. MDX
  links do it on their own (`docs-link.tsx`); a block that renders its own link uses `DocsLink` or `isExternal`.

## Tests

- **Unit tests** (Vitest, project `unit`, `pnpm test`) cover pure logic: a `<name>.test.ts` next to the file it tests.
- **Story tests** (Vitest browser mode, `pnpm test:stories`) cover components in a real Chromium: render, `play`
  interactions, accessibility.
- **Every bug fix ships a test** that fails without it.

## Dependencies

pnpm only. Before writing code against a new library, check whether a skill exists for it and add it to
`.agents/skills/` first. Runtime dependencies (what apps install) need a changeset; dev tools don't.

## Review checklist

Each command should print nothing (font-size lines excepted in the off-grid check).

```sh
# Raw inline CSS: use classes, and toCSSVars for runtime values
rg -n 'style=\{\{' src .storybook

# Class strings built with template literals: use cn()
rg -n 'className=\{`' src

# Imports that go up more than one folder: use the @/ alias
rg -n "from '(\.\./){2,}" src .storybook scripts

# Off-grid spacing classes (odd from 5 up, decimals other than 0.25 and 0.5)
rg -n --pcre2 '(?<![\w-])-?(p[xytrblse]?|m[xytrblse]?|gap(-[xy])?|space-[xy]|inset(-[xy])?|top|right|bottom|left|w|h|size|min-w|min-h|max-w|max-h|basis|translate-[xy])-(?!(1|3|0\.25|0\.5)(?![\w./]))(\d*[13579]|\d+\.\d+)(?![\w./])' src -g '*.tsx' -g '*.ts'

# px in CSS outside comments and hairlines: write rem
rg -n '\b\d+(\.\d+)?px\b' src .storybook -g '*.css' | rg -v '/\*|\b1px'

# rem in CSS without its px comment
rg -n --pcre2 '\d(\.\d+)?rem\b(?!.*/\*.*px.*\*/)' src .storybook -g '*.css'

# Primitives in components (roles first): review each hit
rg -n --pcre2 '(bg|text|border|ring|outline|fill|stroke)-(neutral|blue|green|amber|red)-\d+' src/components

# Deep imports past a barrel
rg -n "from '@/lib/(utils|hooks|motion)/" src

# The full Motion component in a component: use `m` under LazyMotion
rg -n "from 'motion/react'" src/components | rg -w 'motion'
```
