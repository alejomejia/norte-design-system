# 0014. main holds one commit per release

**Status:** Accepted · 2026-11-06 · Replaces [0011](0011-dev-and-main.md)

## Context

[0011](0011-dev-and-main.md) said `main` only moves on a release, by fast-forwarding to `dev`. A fast-forward makes
`main` point at `dev`'s last commit, so every commit made on `dev` became part of `main`. After two releases, `main` had
89 commits, and browsing it showed every fix and docs tweak instead of the versions.

## Decision

- **`dev` is where work happens.** Every commit lands there, and so do the release tags (`vX.Y.Z`), on each release's
  `chore(release)` commit. The full history lives on `dev`.
- **`main` holds the first setup commits, then one commit per release.** Each holds exactly `dev`'s files at that
  version, and its only parent is the previous release. `pnpm release:main` writes it with git's plumbing
  (`commit-tree`, `update-ref`): no checkout, no merge, so no conflicts.
- **`pnpm check` compares with the latest tag,** not with `main`: `main` no longer contains `dev`'s commits, so the two
  only share the setup commits.
- **The `pre-commit` hook blocks every commit on `main`,** merges included.
- **Kept from 0011:** Conventional Commits checked by a hook, no issues or pull requests for the owner's own work, pull
  requests from forks into `dev`, and changesets, `CHANGELOG.md` and semantic versions ([0008](0008-changesets-and-semver.md)).

`main` was rewritten once to match, on 2026-11-06: the 10 setup commits, then `v0.1.0` and `v0.2.0` as one commit
each, with the same files as their tags. The tags didn't move.

## Consequences

- `main` reads as the list of versions, which is what someone browsing the repo should see first.
- `git log v0.1.0..v0.2.0` still lists every commit of a release, through `dev`.
- **Cost:** `main` and `dev` don't share history after the setup commits, so git can't tell that a release on `main`
  came from `dev`; the commit message and the tag on `dev` say it. Never merge `main` into `dev` or the other way.

## Revisit when

A second person starts working on Norte regularly, or the package is published from CI, which may want `main` to
contain the tagged commits.
