# 0007. Vite library build, ESM only

**Status:** Accepted · 2026-11-04

## Context

The package has to be small, typed and safe to install next to the app's own React.

## Decision

`pnpm build` uses Vite's library mode:

- **ES modules only.** Next.js and every modern bundler use them.
- **React stays external,** as a peer dependency. Two copies of React in one app break hooks.
- **`.d.ts` declarations** next to the JavaScript, so apps get the same types the docs show.
- **`theme.css`** with the tokens, for the app's Tailwind (see 0002).

## Consequences

- Fast builds, and the app's bundler decides what to keep.
- **Cost:** no CommonJS output, which only older tooling needs.

## Revisit when

A consumer can't use ES modules.
