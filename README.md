# Norte Design System

Design tokens and React components for **Norte**, a furniture and lighting store, documented in Storybook.

Norte is a fictional brand. This project shows how I build a design system: tokens first, components that read only
tokens, Storybook as a product people want to open, and releases a team can trust. It's based on a real design system
I proposed at a company I work with, rebuilt from scratch with its own brand so it can be public.

> **Status: in progress.** The tooling is in place; the foundations and components come next.

## Stack

- **React 19** components, written for Next.js (App Router) and any React app
- **TypeScript** everywhere (strict)
- **Tailwind CSS v4**, with the design tokens as its theme (CSS custom properties); plain CSS only where Tailwind can't
  reach, and no CSS-in-JS
- **Storybook 10** as the handbook and component catalog, with accessibility checks
- **Vite 8** library build: ESM, React as a peer dependency, `.d.ts` declarations and the `theme.css` tokens
- **Vitest** + Playwright: every story runs as a test in a real browser
- **Biome** for linting and formatting, Tailwind class order included

## Getting started

Requirements: Node `>=22.18` and pnpm 11 (`corepack enable` picks up the version from `packageManager`).

```bash
pnpm install
pnpm exec playwright install chromium   # once: the browser the component tests run in
pnpm dev                                # Storybook on http://localhost:6006
```

## Scripts

| Command                | What it does                                                                    |
| ---------------------- | ------------------------------------------------------------------------------- |
| `pnpm dev`             | Storybook dev server on port **6006**                                           |
| `pnpm build`           | Type-checks, then builds the package into `dist/` (JS, `style.css`, `.d.ts`)    |
| `pnpm build:storybook` | Static Storybook in `storybook-static/`, ready to host                          |
| `pnpm typecheck`       | TypeScript over the library, the stories and the config files                   |
| `pnpm lint`            | ESLint (`pnpm lint:fix` to autofix)                                             |
| `pnpm format`          | Prettier write (`pnpm format:check` to verify)                                  |
| `pnpm test:stories`    | Component tests: every story renders in Chromium, with its accessibility checks |
| `pnpm check`           | `typecheck` + `lint` + `format:check`: run before a pull request                |

## Using it in a Next.js app

The components ship with their Tailwind classes, not compiled CSS, so your app's Tailwind builds them with your own
classes. In the stylesheet your root layout imports:

```css
@import "tailwindcss";
@import "norte-design-system/theme.css";
@source "../node_modules/norte-design-system/dist";
```

## License

[MIT](LICENSE): fork it, use it, take it apart.
