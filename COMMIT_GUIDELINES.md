# Commit Guidelines

This repo follows [Conventional Commits](https://www.conventionalcommits.org/).
Every commit message must have this shape:

```
<type>(<scope>): <short summary>

<optional body>
```

## Type

| Type       | Use for |
|------------|---------|
| `feat`     | New capability (agent, command, rule, skill, hook, script) |
| `fix`      | Bug fix |
| `chore`    | Tooling, config, dependencies, ignore rules — no user-facing behavior change |
| `docs`     | README, CLAUDE.md, `docs/`, comments-only changes |
| `refactor` | Restructuring with no behavior change |
| `style`    | Formatting only (whitespace, naming) — no logic change |
| `test`     | Adding or fixing tests |

## Scope

Scope names the area touched, matching the repo layout in `CLAUDE.md`:

- `agents` — `agents/` subagent definitions
- `rules` — `rules/` always-on guidelines
- `commands` — `commands/` slash commands
- `hooks` — `hooks/`, `scripts/`, `settings.template.json`
- `skills` — `skills/` on-demand domain knowledge
- `mcp` — `mcp-configs/` MCP server templates
- `tooling` — `install.sh`, `install.ps1`, dev scripts
- `ci` — `.github/workflows/`
- `config` — `.gitignore`, `VERSION`, `LICENSE`, root config
- `docs` — `README.md`, `CLAUDE.md`, `docs/`

Omit the scope only when a change is genuinely repo-wide.

## Summary line

- Imperative mood: "add", not "added"/"adds".
- No period at the end.
- ~72 characters max.

## Body (optional)

Explain *why*, not what — the diff already shows what changed. Use it for
context that isn't obvious (a constraint, a workaround, a decision). Skip it
for self-explanatory changes.

## Author

Commits in this repo are authored solely by the repo owner. Do not add
`Co-Authored-By` trailers or any AI-attribution footer, regardless of what
tool assisted in drafting the change.

## Splitting changes

Prefer one commit per logical area (see Scope above) over one giant commit.
A commit should leave the repo in a coherent state.

## Examples

```
feat(agents): add spring-boot reviewer subagent

feat(commands): add /parallel-review multi-agent review command

fix(hooks): resolve cost-tracker path on Windows installs

chore(ci): validate conventional commits on pull requests

docs: document the token-economy model in docs/TOKEN-ECONOMY.md
```
