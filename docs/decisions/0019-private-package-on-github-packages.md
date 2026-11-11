# 0019. A private package on GitHub Packages

**Status:** Accepted · 2026-11-11

## Context

Norte's apps (the first is `norte-app`, the demo at `norte-app.alejandromejia.dev`) need to install the system the way
a product team would: a pinned version, upgraded on purpose, built from a release and not from a folder on a laptop.
Until now the package was `private` in `package.json` and lived nowhere but this repository.

The code is public (MIT), but the package is for Norte's own apps, not something to offer on npm for anyone to depend
on. The options:

- **npm, private:** a paid plan for a scoped private package.
- **A git dependency** (`github:alejomejia/norte-design-system#v0.5.0`): `dist/` isn't committed, so every app
  install would build the package with its whole toolchain.
- **A local link or tarball** (`link:`, `pnpm pack`): fine on one laptop, gone on the server that builds the app.
- **GitHub Packages:** free, next to the repository and its tags, and a package owned by a personal account starts
  private, whatever the repository's visibility.

## Decision

- **The package is `@alejomejia/norte-design-system` on GitHub Packages** (`publishConfig.registry`). GitHub's npm
  registry only takes packages scoped to their owner, hence the scope.
- **It stays private.** Only the owner, and people or repositories given access in the package's settings, can install
  it. A package made public can never be made private again.
- **A pushed release tag publishes it** (`.github/workflows/publish.yml`): the workflow checks that the tag matches
  `package.json`, builds and publishes with the repository's own `GITHUB_TOKEN`. Releasing (decision 0014) doesn't gain
  a step: pushing the tag was already the last one.
- **Apps authenticate to install,** with a token that can read packages (a classic personal access token with
  `read:packages`, or `GITHUB_TOKEN` in a workflow of a repository with access), named in the app's `.npmrc`.

## Consequences

- Apps install a real, versioned release, the same one the Changelog describes.
- Nobody outside can install it, while the code and the handbook stay public.
- **Cost:** every app, laptop and build server needs a token to install, GitHub Packages only takes classic tokens, and
  each app's build has to receive one as a secret. Renaming the package changed its import path, from
  `norte-design-system` to `@alejomejia/norte-design-system`.

## Revisit when

The system is offered to teams outside Norte (publish it on npm, public), or it moves to an organization (the scope
follows the organization).
