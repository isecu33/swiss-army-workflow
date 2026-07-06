# Security Policy

## Reporting a vulnerability

Do **not** open a public issue for security problems. Email the maintainer
(iker.seoane.contact@gmail.com) with details and a reproduction. Expect an
acknowledgement within a few business days.

## Handling secrets in this repo

- Never commit real credentials. `mcp-configs/.mcp.json.template` uses
  `{{PLACEHOLDERS}}`; real values live only in each developer's local
  `~/.claude/settings.json` or a git-ignored `.mcp.json`.
- `.gitignore` blocks `mcp-configs/.mcp.json`, `*.local.json` and `*.bak-*`.
- Personal access tokens must never appear in commits, issues, or PRs. If one
  is exposed, revoke it immediately and rotate.
- Hooks run local code (`scripts/`). Review any hook change as executable code,
  not as config.
