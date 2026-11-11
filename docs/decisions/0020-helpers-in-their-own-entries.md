# 0020. Helpers in entries of their own, documented in the handbook

**Status:** Accepted · 2026-11-11

## Context

Norte app rebuilds the handbook's pages from the package (decision 0019), and the pages use more than components:
`cn` and `tv` with Norte's merge rules, the formatters, hooks like `useMediaQuery` and `useInViewport`, and Motion with
Norte's timings. None of it was exported. An app copying them would drift, and its own `tailwind-merge` would drop
Norte's classes (`cn('text-body-s', 'text-ink')` keeps only one with the default rules).

Everything a package exports is a promise: from `1.0.0` on, renaming or removing it is a breaking change. And what
isn't documented isn't found: nothing in the handbook said the hooks existed.

Fonts were considered too and left out: `next/font` has to be called in the app, and loading fonts is the app's job,
the way its framework does it best. The theme already reads them from `--nt-font-sans` and `--nt-font-mono`.

## Decision

- **Three entries next to the components', each a curated list:** `/utils` (pure, safe in Server Components),
  `/hooks` (client) and `/motion` (client). They live in `src/utils.ts`, `src/hooks.ts` and `src/motion.ts`, and pick
  from `src/lib/`; the rest of `lib/` (color math, shaders, chart ticks, scroll helpers) stays internal.
- **Only what the pages use is exported.** A helper joins an entry when an app needs it, not because it exists.
- **Motion comes through Norte** (`m`, `AnimatePresence`, `LazyMotion`, `MotionConfig`), so an app and the components
  share one copy of Motion, and lazy loading works across both.
- **Each entry has a page under Helpers** in the handbook, with live demos and examples, and a unit test fails if an
  export isn't on its page, the way a missing changeset fails `pnpm check`.

## Consequences

- Apps build their own pieces with the same rules as the components, without copying code.
- The main entry stays the components; the helpers' entries keep client code apart from what runs on the server.
- **Cost:** a larger public API to keep stable, and three pages to keep current. The test makes sure the pages list
  every export, not that every word is still true.

## Revisit when

An app needs a helper that isn't exported (add it, with its docs), or an entry grows past what one page can explain.
