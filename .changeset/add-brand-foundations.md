---
'norte-design-system': minor
---

Add the brand foundations to `theme.css`. Colors come in two layers: primitives (a neutral scale, one blue accent and
status colors) and roles that components read (`canvas`, `surface`, `ink`, `line`, `accent`, `focus`, `success`…).
Set `data-theme="dark"` on `<html>` and the roles remap to the dark theme. It also adds the type scale (`text-caption`
to `text-display`, in Inter and JetBrains Mono), font weights, radii, shadows, easings and durations, which drop to zero
under reduced motion.

The theme replaces Tailwind's defaults: classes like `bg-blue-500`, `text-xl` or `rounded-lg` no longer exist in apps
that import it. Use the Norte names instead (`bg-accent`, `text-heading-s`, `rounded-l`).
