# 0003. tailwind-variants for component styles

**Status:** Accepted · 2026-11-04

## Context

A component's look depends on its props (`variant`, `size`) and its states. Written inline, that becomes long,
conditional class strings in the JSX, and the props' types and the styles can disagree.

## Decision

Each component defines its styles with [tailwind-variants](https://www.tailwind-variants.org/), in a styles file next to
the component:

- **Variants** are declared once, and the component's props are typed from them.
- **Slots** give components with several parts (a card's header, body and actions) one style definition.
- **Class merging is built in,** so an app's `className` replaces the conflicting classes instead of adding to them.

```tsx
;<button className={button({ variant, size, className })} />
```

## Consequences

- The JSX stays readable and the styles stay in one place per component.
- Types and styles can't disagree: a variant that doesn't exist doesn't type-check.
- **Cost:** one more dependency, with a smaller community than cva (which shadcn/ui uses). cva has no slots and needs a
  separate merge helper, so it would mean more code here.

## Revisit when

The library stops being maintained, or Tailwind ships variants of its own.
