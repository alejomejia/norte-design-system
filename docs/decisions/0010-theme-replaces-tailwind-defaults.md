# 0010. The theme replaces Tailwind's defaults, and color comes in two layers

**Status:** Accepted · 2026-11-04

## Context

Tailwind ships a full palette, type scale, radii and shadows. Next to a design system's tokens, that means two ways
to write every value: `bg-accent` or `bg-blue-600`, `text-heading-s` or `text-lg`. Every default left in place is a
door for an off-brand value.

Components also need colors that say what they're for, and text that stays readable.

## Decision

- **`theme.css` resets Tailwind's defaults** (`--color-*: initial` and the same for type, weights, radii, shadows and
  easings) and defines only Norte's. Spacing keeps Tailwind's 4px scale, which already matches the grid.
- **Color has two layers.** Primitives describe a value (`--color-blue-600`). Roles describe a purpose
  (`--color-accent`, `--color-ink-muted`) and point at a primitive. Components only read roles.
- **One theme, light.** Norte has no dark theme for now. Roles keep the door open: a second theme would remap them,
  without touching a component.
- **Colors are written in OKLCH,** where equal steps in lightness look equal, which makes the scales even. Every
  primitive stays inside sRGB, so it looks the same on every screen.
- **Contrast is a test, not a review step.** `pnpm test` reads `theme.css`, resolves every role and checks each pair
  components may combine against WCAG 2.2 AA: 4.5:1 for text, 3:1 for control borders and focus rings.

## Consequences

- One name per value, in the components and in the apps that import the theme.
- Class names say what a color is for (`text-ink-muted`, not `text-neutral-600`), and a rebrand remaps roles instead
  of editing components.
- A color change that breaks contrast fails `pnpm check` before it reaches a release.
- **Cost:** apps that import the theme lose Tailwind's default palette and sizes too. That's the point, but an app
  migrating to Norte has to rename those classes, and the changeset says so.

## Revisit when

Norte needs a dark theme or a second brand (then each one becomes a set of roles), or WCAG 3's contrast method replaces
2.2's.
