# 0012. CSS first, Motion for the rest

**Status:** Accepted · 2026-11-04

## Context

Norte's interactions are part of its brand: a button that settles when pressed, a spinner that turns into a check, a
menu that grows from its trigger. Most of them are a change between two states an element already has, which CSS
transitions handle on the compositor with no JavaScript. A few aren't: an element that animates while it leaves the DOM,
a spring that has to stay smooth when it's interrupted, a sequence of steps, a layout change.

## Decision

- **CSS first.** Hovers, presses and state changes are Tailwind transitions on `transform` and `opacity`, timed with the
  tokens. Under reduced motion the duration tokens drop to zero, so they stop with no check of their own.
- **[Motion](https://motion.dev) 14 for what CSS can't do:** exit animations (`AnimatePresence`), interruptible springs,
  sequences, gestures and layout animations.
- **The small entry only.** Components use the `m` component under a `LazyMotion` whose features
  (`domAnimation`) load the first time something animates (`@/lib/motion`), never `motion.*`, which brings every feature.
- **One spring for both.** `--ease-spring` is Motion's `spring(0.3, 0.3)` written as a CSS `linear()` curve, so a CSS
  press and a Motion check settle the same way. A test fails if the token and Motion drift apart.

## Consequences

- Most animations cost nothing at runtime, and the ones that need Motion run on the compositor where they can (Motion
  animates through the Web Animations API).
- An app pays about 5 KB for `m` once it imports a component that uses Motion, and about 25 KB more, loaded on demand,
  the first time that component animates.
- Until the features arrive, `m` renders the final state without animating: no component can depend on an animation
  finishing.
- **Cost:** a runtime dependency, and two ways to animate to choose between. The rule above, and the `motion` skill,
  make the choice.

## Alternatives

- **CSS only, with the View Transitions API:** no dependency, but exit animations of single elements and interruptible
  springs are awkward, and React's support is still experimental.
- **GSAP:** the strongest timeline tool, but imperative, heavier for small component animations, and built around refs
  rather than React's render model.
- **React Spring:** springs only, with a smaller community and no layout animations.

## Revisit when

React's `<ViewTransition>` is stable and covers exit animations, or Motion's lazy loading stops paying off because every
page animates from the first render.
