# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository governance: `CONTRIBUTING.md`, `COMMIT_GUIDELINES.md`,
  `SECURITY.md`, `CODE_OF_CONDUCT.md`, PR and issue templates, `CODEOWNERS`.
- CI: commit-message validation and toolkit validation on pull requests.

## [1.0.0] - 2026-07-06

### Added
- Initial team-wide Claude Code setup (`~/.claude`) derived from
  everything-claude-code (MIT), curated for Python, TS/Node, React/Next and
  Java/Spring.
- 23 curated subagents, per-language rules, workflow and parallel-orchestration
  commands (`/parallel-tasks`, `/parallel-review`).
- Token-cost and session-save Stop hooks, `/cost-report`, `/model-route`.
- Idempotent installers for macOS, Linux and Windows.
