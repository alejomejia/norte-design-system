# 0002. Tailwind CSS v4, with the tokens as theme

**Status:** Accepted · 2026-11-04

## Context

The apps that use Norte are styled with Tailwind. If the system brought its own way of styling, the app and the
components would end up with two sets of values for the same colors and spaces, and they would drift apart: the exact
problem a design system exists to solve.

The options were plain CSS, CSS Modules, CSS-in-JS and Tailwind.

## Decision

- **Tokens live in Tailwind's `@theme`** (`src/styles/theme.css`). Each one is a CSS custom property and generates its
  utilities: `--color-surface` gives `bg-surface`. Apps import the same file, so their own code and the components read
  the same values.
- **Components ship with their Tailwind classes, not compiled CSS.** The app's Tailwind scans the package (`@source`)
  and builds only the classes that are used, once.
- **Plain CSS only where Tailwind can't reach** (keyframes, complex selectors). **No CSS-in-JS.**

## Consequences

- One source of truth for every value, in the app and in the system.
- Themes and dark mode are CSS: redefine the variables, no JavaScript.
- Works with Server Components. Runtime CSS-in-JS (styled-components, Emotion) needs client-side context, which works
  against the App Router.
- Overrides are predictable: an app passes `className`, and conflicting classes are merged (see 0003) instead of
  fighting over specificity.
- Shipping compiled CSS instead would put two Tailwind builds on one page: duplicated rules competing over order.
- **Cost:** apps need Tailwind v4. And class lists get long, which 0003 deals with.

## Revisit when

An app without Tailwind needs the system. Then a compiled stylesheet can ship as a second output, built from the same
classes.
