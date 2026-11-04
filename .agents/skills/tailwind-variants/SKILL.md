---
name: tailwind-variants
description: How Norte writes component styles with tailwind-variants 3.3 (tv): the shared `tv` from `@/lib/utils` that knows Norte's type scale, variants, slots, compound variants, defaults, typing props with VariantProps, and passing `className` through. Use whenever writing or changing a `<name>.styles.ts` file or a component's variant props.
---

# tailwind-variants in Norte

Version **3.3** (decision 0003). 4.0 replaced tailwind-merge with its own engine; Norte stays on 3.3 until 4.0 has
settled, then moves to its `lite` entry with Norte's merger injected.

## Always import `tv` from `@/lib/utils`

Never from `tailwind-variants`. Norte's `tv` is `createTV` with the same tailwind-merge config as `cn`, so both know
Norte's type scale: without it, `text-body-s text-on-accent` looks like two colors and the size is dropped.

## A styles file

One `<name>.styles.ts` per component, exporting the recipe and its option lists:

```ts
import { tv, type VariantProps } from '@/lib/utils'

export const button = tv({
  base: 'inline-flex items-center justify-center gap-2 rounded-m font-medium',
  variants: {
    variant: {
      primary: 'bg-accent text-on-accent hover:bg-accent-hover',
      secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-muted',
    },
    size: { s: 'h-8 px-3 text-body-s', m: 'h-10 px-4 text-body-s' },
    // Boolean variants take `true` / `false` keys.
    loading: { true: 'cursor-progress' },
  },
  // Only for combinations; one variant's look stays in its own key.
  compoundVariants: [{ variant: 'secondary', loading: true, class: 'bg-surface-muted' }],
  defaultVariants: { variant: 'primary', size: 'm' },
})

export type ButtonVariants = VariantProps<typeof button>
```

- **Call it with the props and `className` last:** `button({ variant, size, loading, className })`. tv merges
  `className` over the recipe, so an app's class wins over the conflicting one.
- **Option lists for the stories** come from the recipe's keys, never retyped:
  `Object.keys(button.variants.variant)`, or an `as const` array in `<name>.const.ts` that both use.
- **Slots** for parts of one component (`root`, `label`, `icon`): `slots: { root: '…', icon: '…' }`, then
  `const { root, icon } = card({ size })` and `root({ className })`. Variants can target slots:
  `size: { s: { root: 'p-3', icon: 'size-4' } }`.
- **States from Base UI go in the classes** (`data-disabled:opacity-50`, `data-highlighted:bg-surface-muted`), not in
  variants: Base UI already knows the state.
- **`extend`** shares a recipe (`tv({ extend: button, base: '…' })`); prefer it over copying classes.
- Defaults live in `defaultVariants`; a component's props default to the same values, so the props table shows them.
