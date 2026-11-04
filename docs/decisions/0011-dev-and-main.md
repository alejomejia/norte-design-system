# 0011. Work on dev, release on main

**Status:** Accepted · 2026-11-04 · Replaces [0009](0009-git-workflow.md)

## Context

[0009](0009-git-workflow.md) set up a team workflow: an issue for every change, a branch named after it, and a pull
request to merge it. Norte has one developer. Opening an issue and a pull request to review your own work is ceremony,
and the history it leaves pretends there's a team.

What the people who use the package need didn't change: a clear changelog, versions they can pin, and a way to see
what shipped in each one.

## Decision

- **`dev` is where work happens.** Every commit lands there.
- **`main` only moves on a release:** `dev` is merged into it (fast-forward), and the release is tagged there. Every
  commit on `main` is a version.
- **Kept from 0009:** Conventional Commits, checked by a `commit-msg` hook, and a `pre-commit` hook that stops commits
  straight to `main`.
- **Dropped:** issues per change, ticket prefixes in branch names, and pull requests for the owner's own work.
- **Unchanged (see [0008](0008-changesets-and-semver.md)):** changesets, `CHANGELOG.md`, semantic versions and tags.
- **Outside contributions** still come as pull requests from forks, into `dev`.

## Consequences

- Less ceremony per change, and a history that reads like what happened.
- `main` is always the latest release, which is what someone browsing the repo should see first.
- **Cost:** no second pair of eyes before a change lands on `dev`. `pnpm check` (types, lint, tests, contrast,
  changesets) is the safety net.

## Revisit when

A second person starts working on Norte regularly. Then 0009's workflow comes back.
