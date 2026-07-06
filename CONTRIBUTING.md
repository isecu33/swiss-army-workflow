# Contributing to swiss-army-workflow

Thanks for improving the team's Claude Code setup. This repo is the shared
`~/.claude` configuration; changes here reach every developer, so we keep a
tight, reviewed workflow.

## Branching model — Gitflow

| Branch | Purpose | Base | Merges into |
|--------|---------|------|-------------|
| `main` | Production-ready. Tagged releases only. | — | — |
| `develop` | Integration branch for the next release. | `main` | — |
| `feature/*` | New agents, commands, rules, hooks, docs. | `develop` | `develop` |
| `fix/*` | Non-urgent bug fixes. | `develop` | `develop` |
| `release/*` | Release stabilization + version bump. | `develop` | `main` + `develop` |
| `hotfix/*` | Urgent production fixes. | `main` | `main` + `develop` |

Typical flow:

```bash
git checkout develop && git pull
git checkout -b feature/short-descriptive-name
# ...work, commit per logical area...
git push -u origin feature/short-descriptive-name
# open a PR targeting `develop`
```

Branch names: lowercase, hyphenated, prefixed by type
(`feature/spring-reviewer`, `fix/windows-hook-path`).

## Commits

Follow [`COMMIT_GUIDELINES.md`](./COMMIT_GUIDELINES.md) (Conventional Commits).
CI validates every commit in a PR; non-conforming messages block the merge.

## Adding to the setup

- **Agent** → `agents/<name>.md`, YAML frontmatter (`name`, `description`,
  `tools`, `model`). File name matches `name`.
- **Command** → `commands/<name>.md`, frontmatter `description`.
- **Rule** → `rules/<language>/<topic>.md`. Keep always-on rules minimal.
- **Skill** → `skills/<name>/SKILL.md`, frontmatter (`name`, `description`).
- **Hook** → script in `scripts/`, wired in `settings.template.json` with a
  specific matcher. Exit `1` only to block intentionally.

## Pull requests

1. One coherent change per PR; target `develop`.
2. Fill in the PR template (what, why, testing).
3. CI must be green (commitlint + toolkit validation).
4. At least one approval from a `CODEOWNERS` owner.
5. Squash is disabled — we keep the per-area commits (see commit guidelines).

## Local checks before pushing

```bash
node scripts/cost-tracker.js < /dev/null   # must exit 0
bash install.sh --dry-run                  # must print the plan without error
```

## Releasing (maintainers)

```bash
git checkout -b release/x.y.z develop
# bump VERSION + CHANGELOG
git checkout main && git merge --no-ff release/x.y.z && git tag vx.y.z
git checkout develop && git merge --no-ff release/x.y.z
git push origin main develop --tags
```
