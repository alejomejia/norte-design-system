# Contributing

How a change gets into Norte: branches, commits, changesets and releases. Why it works this way is in
[decisions 0008 and 0011](docs/decisions/README.md).

## Branches

Two long-lived branches:

- **`dev`:** where work happens. Every change is committed here.
- **`main`:** the latest release. It only moves when a release is merged from `dev`, so every commit on it is a version
  with a tag.

```
dev  ──●──●──●──●──●──●──●──●──●──●──
             \                 \
main ─────────●─────────────────●────
            v0.1.0            v0.2.0
```

Every change:

1. **Commit** on `dev`, following the [commit rules](#commits).
2. **Add a changeset** if the change ships in the package (see [Changesets](#changesets)).
3. **Run `pnpm check`.** It also fails if you changed the package and forgot the changeset.

A larger piece of work can live on a short branch off `dev` and be merged back when it's done.

**Contributing from a fork?** Open a pull request into `dev`, with a changeset if your change ships.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), in English: **`type(scope): summary`**

- `type` is one of `feat`, `fix`, `refactor`, `style` (formatting only), `docs`, `test`, `build` or `chore`.
- `scope` is the component or area, in kebab-case: `button`, `tokens`, `handbook`, `storybook`.
- The summary is imperative, starts with a lowercase letter and has no period: `feat(button): add a loading state`.
- The whole first line is 72 characters at most.
- Add a body only when the reason isn't obvious, after an empty line.
- No AI attribution: no AI co-author, "Generated with…" lines or session trailers. A human co-author is fine.

## Automatic checks

Git checks the rules above. The hooks live in `.githooks/`, and `pnpm install` turns them on.

| When         | What's checked                         |
| ------------ | -------------------------------------- |
| `git commit` | You're not committing straight to main |
| `git commit` | The commit message follows the rules   |

When a check fails, git stops and says what's wrong and how to fix it. Nothing is committed.

- The rules live in [`scripts/git-hooks/git-rules.ts`](scripts/git-hooks/git-rules.ts), with tests next to them
  (`pnpm test`).
- Merges, reverts and fixups are allowed.
- Hooks not running after a clone? Run `pnpm run prepare` once.
- `--no-verify` skips the checks. Only in a real emergency, and never from an AI agent.

## Changesets

A changeset is a note you leave with your change: one or two sentences saying what changed for the people who install
the package, and how big the change is. At the next release, the notes waiting on `main` become the new entry in
[`CHANGELOG.md`](CHANGELOG.md), decide the new version number, and are deleted.

```bash
pnpm changeset
```

It asks how big the change is and for a summary, then writes `.changeset/<random-name>.md`. Commit that file with your
change. `pnpm release:status` shows the notes waiting and the version they add up to.

**When to add one.** Ask: _will someone who installs the package get something different?_

- **Yes, add one:** components, props, tokens, classes, exports, and the dependencies apps install.
- **No:** docs, handbook pages, stories, the Storybook setup, tests, refactors with no visible effect, and dev tools.
  They don't create a version. They go live when they're merged.

**You can't forget it.** `pnpm check` runs `changeset status`, which compares `dev` with `main` (the last release). If
you changed files that ship (anything in `src/` except stories, tests and handbook pages) and there's no changeset, it fails. Which
files count is set by `changedFilePatterns` in `.changeset/config.json`. The one case it can't spot is a change to the
dependencies apps install (they live in `package.json`, next to the dev tools): add the note yourself.

**Which bump to pick:**

| Bump    | While the version is `0.x`               | From `1.0.0` on  |
| ------- | ---------------------------------------- | ---------------- |
| `patch` | Fixes                                    | Fixes            |
| `minor` | New features **and breaking changes**    | New features     |
| `major` | Never: it would jump straight to `1.0.0` | Breaking changes |

Breaking means an app has to change its code to upgrade: a renamed prop, token or class, a removed export, a changed
default.

**How to write it:** one line, for the people using the package: what changed, in the imperative, with names in
backticks. It says _what_ is in the release, not how it works: the details belong on the component's docs page, which
the Changelog links to from each name. A breaking change adds one sentence: what apps must change.

```md
---
'norte-design-system': minor
---

Rename the `kind` prop of `Button` to `variant`. Replace `kind="…"` with `variant="…"` where you use it.
```

**How the next version is decided.** Notes don't add up: a release raises the version once, by the biggest note
waiting. Five `minor` notes take `0.1.0` to `0.2.0`, not `0.6.0`. Only `patch` notes give `0.1.1`.

**Forgot one?** Add it in a later commit. Changesets are plain files, so they can be edited until the release.

## Releasing

A release turns the waiting changesets into a version: it bumps `package.json`, writes `CHANGELOG.md`, and tags the
release on `main` as `vX.Y.Z`. It happens when `dev` has something worth shipping.

```bash
# 1. On dev: preview the version, then write it
git switch dev
pnpm release:status               # the next version and the notes it includes
pnpm release:version              # bumps package.json, writes CHANGELOG.md, deletes the used changesets
pnpm typecheck && pnpm lint && pnpm test && pnpm build   # and read CHANGELOG.md
git commit -am "chore(release): v0.2.0"

# 2. Move main to it and tag it
git switch main
git merge --ff-only dev
pnpm release:tag                  # the annotated tag v0.2.0, from package.json
git push origin main dev v0.2.0
git switch dev
```

- **Not `pnpm check` in step 1:** its `changeset status` compares `dev` with `main`, and once `release:version` has used
  the changesets, it sees changed files with no note until `main` moves. Run the other checks on their own.
- **`main` only fast-forwards to `dev`.** If `--ff-only` refuses, `main` has a commit that `dev` doesn't: find out why
  before going further.
- **A pushed tag never moves and is never deleted.** If a release has a bug, fix it on `dev` and release a patch.

## Versions

Versions follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`. Norte stays on `0.x` while the
foundations settle, and moves to `1.0.0` once a product uses it in production.

Apps choose when to upgrade: they pin a version, read [`CHANGELOG.md`](CHANGELOG.md), and move when they're ready. To
see what shipped between two versions:

```bash
git tag --list                        # every release
git log v0.1.0..v0.2.0 --oneline      # the commits between two releases
```
