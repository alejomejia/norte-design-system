---
'norte-design-system': minor
---

Add the `--ease-spring` easing (`ease-spring`) and its `--duration-spring` duration: Motion's `spring(0.3, 0.3)` as a CSS
`linear()` curve, for small things that settle, like a press or a check. `cn` and `tv` now know Norte's easings, so
`cn('ease-standard', 'ease-spring')` keeps only the last one.
