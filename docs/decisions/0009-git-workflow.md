# 0009. One main branch, checked by git hooks

**Status:** Superseded by [0011](0011-dev-and-main.md) · 2026-11-04

## Context

Conventions written only in a document get skipped, by people and by AI agents alike. A history full of unclear
branches and commits makes it hard to find why something changed.

## Decision

- **`main` is the only long-lived branch,** always releasable. Every change arrives through a short-lived branch and a
  squash-merged pull request.
- **Branches are named after their issue:** `nt-<issue>/<verb>-<what>`, where the issue is the GitHub issue number
  (`nt-12/add-button`). Releases use `release/vX.Y.Z`.
- **Commits follow [Conventional Commits](https://www.conventionalcommits.org/):** `type(scope): summary`.
- **Git hooks check all of it,** turned on by `pnpm install`: no commits on `main`, branch names on commit and on push,
  commit messages on commit. The rules live in one tested file.

The full rules are in [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

## Consequences

- Every change links to the issue that asked for it, and the history reads like a list of decisions.
- A wrong name or message is caught on the developer's machine, with a message that says how to fix it.
- **Cost:** a little ceremony for small changes, and hooks can be skipped with `--no-verify`. The pull request review is
  the second line.

## Revisit when

The team grows enough to need protected branches and required checks on the server too (both belong on GitHub once
the repo is public).
