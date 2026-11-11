# Norte Design System

Design tokens and React components for **Norte**, a workspace where teams run AI agents and review their work,
documented in Storybook.

Norte is a fictional brand. This project shows how I build a design system: tokens first, components that read only
tokens, Storybook as a product people want to open, and releases a team can trust. It's based on a real design system
I proposed at a company I work with, rebuilt from scratch with its own brand so it can be public.

> **Status: in progress.** The tooling and the foundations are in place; the components come next.

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
| `pnpm build`           | Type-checks, then builds the package into `dist/` (JS, `theme.css`, `.d.ts`)    |
| `pnpm build:storybook` | Static Storybook in `storybook-static/`, ready to host                          |
| `pnpm clean:storybook` | Deletes Storybook's cache (`dev` and `build:storybook` prune it on their own)   |
| `pnpm typecheck`       | TypeScript over the library, the stories, the scripts and the config files      |
| `pnpm lint`            | Biome: lint, format and import order (`pnpm lint:fix` to fix what it can)       |
| `pnpm test`            | Tests for the commit rules and the color contrast                               |
| `pnpm test:stories`    | Component tests: every story renders in Chromium, with its accessibility checks |
| `pnpm check`           | `typecheck` + Biome + `test` + changeset check: run before pushing              |
| `pnpm changeset`       | Records a change for the next release's changelog                               |
| `pnpm release:status`  | Lists the waiting changesets and the version they add up to                     |
| `pnpm release:version` | Turns the waiting changesets into a version bump and `CHANGELOG.md` entries     |
| `pnpm release:tag`     | Tags the current commit as `vX.Y.Z` (on `main`, after merging the release)      |

## Publishing the handbook

The handbook runs at [norte-design-system.alejandromejia.dev](https://norte-design-system.alejandromejia.dev), on a VPS
with Dokploy ([decision 0018](docs/decisions/0018-dokploy-on-a-vps.md)). Dokploy builds the `Dockerfile` from `main` on
every release: the static Storybook, served by an unprivileged nginx on port 8080 (`deploy/`), behind Cloudflare. To
try the image locally:

```sh
docker build -t norte-handbook . && docker run --rm -p 8080:8080 norte-handbook   # http://localhost:8080
```

The build carries Umami's tracker ([decision 0017](docs/decisions/0017-umami-analytics.md)), which only counts visits
on the published domain, one page view per story. To leave your own visits out, run
`localStorage.setItem('umami.disabled', 1)` once in your browser's console on the published site.

## Using it in a Next.js app

The package is `@alejomejia/norte-design-system`, private on GitHub Packages
([decision 0019](docs/decisions/0019-private-package-on-github-packages.md)): every release tag publishes it, and only
accounts given access can install it. In the app, an `.npmrc` next to `package.json` points the scope at GitHub:

```ini
@alejomejia:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` is a GitHub token that can read packages: a classic personal access token with `read:packages`, or
`gh auth token` after `gh auth refresh --scopes read:packages`. The server that builds the app needs it as a secret
too. Then `pnpm add @alejomejia/norte-design-system`.

The components ship with their Tailwind classes, not compiled CSS, so your app's Tailwind builds them with your own
classes. In the stylesheet your root layout imports:

```css
@import "tailwindcss";
@import "@alejomejia/norte-design-system/theme.css";
@source "../node_modules/@alejomejia/norte-design-system/dist";
```

The theme replaces Tailwind's default colors, type sizes, radii and shadows with Norte's (see
[decision 0010](docs/decisions/0010-theme-replaces-tailwind-defaults.md)).

- **Fonts:** Norte uses Inter and JetBrains Mono. With `next/font`, expose them as the `--nt-font-sans` and
  `--nt-font-mono` variables and the theme picks them up. Without them, it falls back to the system fonts.

## Contributing and versions

Work happens on `dev`, and every change that ships leaves a changeset that becomes its line in
[`CHANGELOG.md`](CHANGELOG.md). `main` only moves on a release: each one follows semantic versioning and is tagged, so
apps choose when to upgrade and can always see what shipped in each version. The rules, checked by git hooks, are in
[`CONTRIBUTING.md`](CONTRIBUTING.md). Why the project is built this way is in [`docs/decisions/`](docs/decisions/).

## License

[MIT](LICENSE): fork it, use it, take it apart.
