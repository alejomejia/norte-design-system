# 0018. The handbook on a VPS, with Dokploy

**Status:** Accepted · 2026-11-11

## Context

The handbook (the static Storybook) is published at `norte-design-system.alejandromejia.dev`, next to a demo app at
`norte-app.alejandromejia.dev`. The author already runs a VPS with Dokploy, which builds apps from GitHub and routes
their domains through Traefik. The domain's DNS is on Cloudflare.

Dokploy offers several build types. **Static** serves the repository's files as they are, with no build step.
**Nixpacks** and **Railpack** guess the build from `package.json`, and their pnpm and Node versions follow the tool's
release, not the project. A **Dockerfile** spells out every step.

Dokploy clones the branch with `--depth 1`, so the release tags aren't there, and the Changelog page reads each
release's date from its tag (`.storybook/main.ts`).

## Decision

- **A two-stage `Dockerfile`:** Node 24 installs with the pnpm version `package.json` names and runs
  `pnpm build:storybook`, then nginx serves `storybook-static/` on port 8080 (`deploy/nginx.conf`), from
  `nginx-unprivileged`, so the server doesn't run as root. Only the static files reach that image: no source, no `.git`.
- **Cloudflare in front, proxied, in Full (strict) mode,** with a Cloudflare Origin CA certificate in Traefik. Cloudflare
  sets HSTS and redirects to HTTPS.
- **Security headers on every response** (`deploy/security-headers.inc`): only this site may frame its pages, no
  plugins, no `<base>`, and of the powerful browser features only the microphone (the Voice input stories). Scripts
  aren't restricted: Storybook's HTML runs inline scripts, and the site has no accounts, cookies or input to protect.
- **The build fetches the tags** (`git fetch --depth=1 --tags`) before building, from the public repository. If that
  fails, the Changelog shows no dates and the build goes on.
- **Dokploy deploys `main`,** so the published handbook changes once per release (decision 0014) and its version and
  Changelog match the package's.
- **nginx caches what has a hash in its name** (`/assets/`) for a year and has browsers check everything else on every
  visit: Storybook's own bundles keep their names between builds.

## Consequences

- The image builds the same way on the VPS and on a laptop (`docker build .`), so a failed deploy can be reproduced.
- Work on `dev` doesn't reach the published handbook until it's released.
- **Cost:** the Dockerfile is Norte's to keep up: Node's version, nginx's, and the cache rules if Storybook changes how
  it names its files. A new browser feature a story needs (the camera, say) has to join `Permissions-Policy`.

## Revisit when

The handbook needs previews per branch or pull request (a host with preview deploys, or Dokploy's preview
deployments), or the repository goes private (the tag fetch then needs a token).
