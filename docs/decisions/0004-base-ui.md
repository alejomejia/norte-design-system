# 0004. Base UI for accessible behavior

**Status:** Accepted · 2026-11-04

## Context

The hardest part of a component is rarely how it looks. It's how it behaves: keyboard navigation in a menu, focus that
stays inside a dialog, the right ARIA roles and states, typing to jump through a list. Getting that right for every
component, in every browser and screen reader, is a project of its own.

## Decision

Interactive components are built on [Base UI](https://base-ui.com/): unstyled, accessible primitives from much of the
team behind Radix and Floating UI. Norte adds the brand on top. Base UI exposes each state as a data attribute, which
Tailwind styles directly:

```tsx
<Menu.Item className="data-highlighted:bg-surface-raised data-disabled:opacity-50" />
```

Simple components with no behavior to borrow (a badge, a card) are plain elements.

## Consequences

- Accessibility patterns come tested, and the brand stays entirely Norte's: Base UI has no look to undo.
- States are styled the same way everywhere, through data attributes.
- **Cost:** Norte depends on Base UI's API and release pace. React Aria Components was the alternative: just as strong
  on accessibility, with a heavier API.

## Revisit when

Base UI stops covering a pattern Norte needs, or its maintenance slows down.
