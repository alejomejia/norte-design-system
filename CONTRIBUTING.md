# Contributing

How a change gets into Norte: issues, branches, commits, changesets and releases. Why it works this way is in
[decisions 0008 and 0009](docs/decisions/README.md).

## The workflow

`main` is the only long-lived branch, and it's always releasable. Every change goes through a short-lived branch named
after its GitHub issue. Releases are the exception: their branch is named after the version.

```
        nt-12/add-button        nt-15/fix-menu-focus        release/v0.2.0
            ●───●                    ●───●                       ●
           /     \                  /     \                     / \
main ──●──●───────●────────────────●───────●───────────────────●───●──
     v0.1.0                                                       v0.2.0
```

Every change:

1. **Open an issue,** or pick one: it says what's wrong or missing, and why.
2. **Branch** from an up-to-date `main`: `nt-<issue>/<verb>-<what>` (see [Branch names](#branch-names)).
3. **Change** the code and commit it.
4. **Add a changeset** if the change ships in the package (see [Changesets](#changesets)).
5. **Run `pnpm check`.** It also fails if you changed the package and forgot the changeset.
6. **Open a pull request** into `main`. Once it's approved, **squash-merge** it and delete the branch.

Nobody commits straight to `main`: every change, releases included, arrives through a pull request.

## Branch names

Format: **`nt-<issue>/<short-description>`**, where `<issue>` is the GitHub issue number.

| Change                       | Example                     |
| ---------------------------- | --------------------------- |
| A new component or feature   | `nt-12/add-button`          |
| A bug fix                    | `nt-15/fix-menu-focus-ring` |
| Docs or Storybook only       | `nt-18/update-readme-setup` |
| A dependency or tool upgrade | `nt-21/upgrade-storybook`   |
| Removing something           | `nt-24/remove-legacy-badge` |
| A release (no issue)         | `release/v0.2.0`            |

- **The prefix is lowercase:** `nt-12/…`, never `NT-12/…` or `feature/nt-12-…`.
- **The description is lowercase kebab-case, ASCII only:** `add-button`, never `AddButton`, `add_button` or
  `añadir-boton`.
- **It starts with one of six verbs:** `add`, `fix`, `update`, `remove`, `refactor` or `upgrade`.
- **It has 2 to 5 words, the verb included.** For component work, name the component: `nt-30/fix-card-header-spacing`.
- **Release branches have no issue:** exactly `release/vX.Y.Z`.
- **One branch, one issue, one pull request.** Keep it short-lived and delete it after merging.

```bash
git switch main && git pull
git switch -c nt-12/add-button
```

**For AI agents:** use this format whenever you create a branch, and ask for the issue number if you don't have it. If
you're asked to commit on `main`, say so and propose a branch name first.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), in English: **`type(scope): summary`**

- `type` is one of `feat`, `fix`, `refactor`, `style` (formatting only), `docs`, `test`, `build` or `chore`.
- `scope` is the component or area, in kebab-case: `button`, `tokens`, `handbook`, `storybook`.
- The summary is imperative, starts with a lowercase letter and has no period: `feat(button): add a loading state`.
- The whole first line is 72 characters at most.
- Add a body only when the reason isn't obvious, after an empty line.
- Pull requests are squash-merged, so **the pull request title becomes the commit on `main`**: write it in this format.
- No AI attribution: no AI co-author, "Generated with…" lines or session trailers. A human co-author is fine.

## Automatic checks

Git checks the rules above. The hooks live in `.githooks/`, and `pnpm install` turns them on.

| When         | What's checked                                     |
| ------------ | -------------------------------------------------- |
| `git commit` | You're not on `main`, and the branch name is valid |
| `git commit` | The commit message is valid                        |
| `git push`   | The names of the branches you push                 |

When a check fails, git stops and says what's wrong and how to fix it. Nothing is committed or pushed.

- The rules live in [`scripts/git-hooks/git-rules.ts`](scripts/git-hooks/git-rules.ts), with tests next to them
  (`pnpm test`).
- Merges, reverts and fixups are allowed, also on `main`.
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

**You can't forget it.** `pnpm check` runs `changeset status`, which compares your branch with `main`. If you changed
files that ship (anything in `src/` except stories, tests and handbook pages) and there's no changeset, it fails. Which
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

**How to write it:** for the people using the package, in the imperative, with names in backticks. For a breaking
change, also say what apps must change.

```md
---
'norte-design-system': minor
---

Rename the `kind` prop of `Button` to `variant`. Replace `kind="…"` with `variant="…"` where you use it.
```

**How the next version is decided.** Notes don't add up: a release raises the version once, by the biggest note
waiting. Five `minor` notes take `0.1.0` to `0.2.0`, not `0.6.0`. Only `patch` notes give `0.1.1`. The release branch
name repeats that number, it doesn't choose it.

**Forgot one?** If the pull request is merged, open a small follow-up that only adds the changeset. Changesets are plain
files, so they can be edited until the release.

## Releasing

A release turns the waiting changesets into a version: it bumps `package.json`, writes `CHANGELOG.md`, and tags the
commit on `main` as `vX.Y.Z`. One person does it, when `main` has something worth shipping.

```bash
# 1. Preview the next version
git switch main && git pull
pnpm release:status

# 2. Prepare it on a release branch
git switch -c release/v0.2.0
pnpm release:version              # bumps package.json, writes CHANGELOG.md, deletes the used changesets
pnpm check && pnpm build          # and read CHANGELOG.md
git commit -am "chore(release): v0.2.0"
```

3. Open a pull request titled `chore(release): v0.2.0` and squash-merge it.
4. Tag the merged commit and push the tag:

   ```bash
   git switch main && git pull
   pnpm release:tag                 # the annotated tag v0.2.0, from package.json
   git push origin v0.2.0
   ```

- **Tags only go on `main`,** on the merged release commit.
- **A pushed tag never moves and is never deleted.** If a release has a bug, fix it and release a patch.
- **Urgent fixes follow the same flow:** a `fix` branch with a `patch` changeset, released right after it merges.

## Versions

Versions follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`. Norte stays on `0.x` while the
foundations settle, and moves to `1.0.0` once a product uses it in production.

Apps choose when to upgrade: they pin a version, read [`CHANGELOG.md`](CHANGELOG.md), and move when they're ready. To
see what shipped between two versions:

```bash
git tag --list                        # every release
git log v0.1.0..v0.2.0 --oneline      # the commits between two releases
```
