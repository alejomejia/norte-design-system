---
name: motion
description: How Norte animates with Motion 14 (the `motion` package, formerly Framer Motion) and when it doesn't: CSS first for hovers, presses and state changes; Motion for enter/exit, springs, sequences and layout. Covers the small `m` component under a lazily loaded `LazyMotion`, `AnimatePresence`, reduced motion, CSS springs from `spring()`, and the performance rules. Use whenever a change adds or edits an animation in src/.
---

# Motion in Norte

[Motion](https://motion.dev/docs/react) 14 (`motion`, decision 0012). Written from the official docs
([bundle size](https://motion.dev/docs/react-reduce-bundle-size), [accessibility](https://motion.dev/docs/react-accessibility),
[performance](https://motion.dev/docs/performance)) and the types in `node_modules/framer-motion/dist/index.d.ts`, which
`motion/react` re-exports. Read them before using an API this skill doesn't cover.

## CSS first

Most of a design system's motion is a transition between two states an element already has: hover, press, open,
selected. **That's CSS**: a Tailwind transition on `transform` and `opacity`, timed with the tokens
(`duration-(--duration-fast)`, `ease-standard`, `ease-spring`). It costs no JavaScript, runs on the compositor, reverses
itself when interrupted, and stops under reduced motion because the duration tokens drop to zero.

Reach for Motion only when CSS can't do it well:

- **Exit animations:** an element that leaves the DOM (a spinner swapped for a check, a toast, a dialog) → `AnimatePresence`.
- **Springs on values that change mid-flight**, sequences and gestures (drag, pan).
- **Layout animations** (a tab indicator sliding between tabs). Costly: one per component at most, on small elements.

A spring in CSS doesn't need Motion at runtime: the `--ease-spring` token is the `linear()` curve of Motion's
`spring()`, checked against it by `src/styles/theme.test.ts`.

## Never `motion.*` in a component: `m.*` under `LazyMotion`

`motion.div` brings every feature (about 34 KB) and can't be tree-shaken. Norte's components use the `m` component
(about 5 KB) and load the features they need lazily, the first time a component animates:

```tsx
import { AnimatePresence, LazyMotion } from 'motion/react'
import * as m from 'motion/react-m'

import { loadMotionFeatures } from '@/lib/motion'

<LazyMotion features={loadMotionFeatures} strict>
  <AnimatePresence>{busy && <m.span key="spinner" exit={{ opacity: 0 }} />}</AnimatePresence>
</LazyMotion>
```

- `loadMotionFeatures` (`@/lib/motion`) dynamically imports `domAnimation` (animations, variants, exit, hover/tap/focus
  gestures). An app that never shows the animation never downloads it. Ask before adding `domMax` (drag and layout):
  it's 38 KB.
- `strict` throws if a `motion.*` component slips in under it.
- Wrap only the part that animates, not the whole component, and mount it only while it animates.
- Until the features arrive, `m` renders the target state with no animation: never let correctness depend on an
  animation finishing.
- Files that use Motion need `'use client'`.

## Reduced motion

- Components that use Motion wrap their animated part in `<MotionConfig reducedMotion="user">`: transforms and layout
  animations stop under the OS setting, while opacity still fades (which is fine: fades don't trigger motion sickness).
- For anything else (a check that draws itself, a parallax), branch on `useReducedMotion()`.
- CSS transitions already stop through the duration tokens: no media query of their own.

## Performance

- **Animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`.** `filter`, `clipPath` and SVG `pathLength` are
  fine on small elements. Never `width`, `height`, `top`, `padding` or `box-shadow`: fade a pseudo-element's shadow in
  instead.
- **No React state per frame.** Values that follow the pointer or the scroll go through motion values or a ref.
- **`will-change` only while it helps**, never on every element: each layer costs GPU memory.
- Continuous animations pause off-screen (`useInViewport`, norte-conventions).

## Timing

Durations in Motion transitions are seconds, from `src/lib/motion` (`MOTION_DURATION`), which mirrors the CSS tokens.
Entrances use `ease-enter`'s curve or a spring with no visible bounce; a spring with bounce is for small, playful
confirmations (a check), never for large surfaces.
