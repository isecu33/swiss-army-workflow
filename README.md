# team-claude — Configuración global de Claude Code para el equipo

Config compartida de Claude Code (agents, commands, rules, hooks, skills) para
**todos los proyectos del equipo**. Basada en el esquema de
[everything-claude-code](https://github.com/affaan-m/everything-claude-code)
(ganador del hackathon de Anthropic, MIT), curada para nuestro stack y con
orquestación **paralela nativa** y **control de coste de tokens**.

Stack objetivo: **Python** (FastAPI/Django) · **TypeScript/Node** ·
**React/Next.js** · **Java/Spring Boot**.

---

## Qué aporta

- **Economía de tokens** por niveles: rules siempre cargadas (mínimas),
  skills/agents/commands solo bajo demanda. Detalle en `docs/TOKEN-ECONOMY.md`.
- **Ejecución en paralelo** de tareas y revisiones (`/parallel-tasks`,
  `/parallel-review`) con git worktrees + subagentes aislados. Sin runtime
  externo.
- **Enrutado de modelo** por complejidad/coste (`/model-route`) y **reporte de
  gasto** local (`/cost-report`, alimentado por el hook `cost-tracker`).
- **23 subagentes** especializados y **rules por lenguaje** para delegar y
  mantener el hilo principal limpio.

## Instalación (cada dev)

```bash
git clone <URL-del-repo-del-equipo> ~/team-claude
cd ~/team-claude
./install.sh            # macOS/Linux  (symlinks a ~/.claude; --copy si no hay symlinks)
# Windows:  .\install.ps1   (usa Modo Desarrollador para symlinks, o -Copy)
```

Luego reinicia Claude Code. Comprueba: `/cost-report`, `/parallel-tasks`,
`/parallel-review`, `/model-route`.

`--dry-run` / `-DryRun` muestra los cambios sin aplicarlos. El instalador hace
**backup** de lo que haya en `~/.claude` y **mergea** los hooks en tu
`settings.json` sin borrar tu config previa.

## Actualizaciones

Como se instala con symlinks, propagar cambios es:

```bash
cd ~/team-claude && git pull      # y re-ejecuta ./install.sh si cambió settings/hooks
```

## Instalación como plugin (alternativa moderna)

Además del instalador por symlink, el repo está empaquetado como plugin de
Claude Code, el mecanismo canónico para compartir setups en equipo (versionado
y con updates de un comando):

```
/plugin marketplace add isecu33/swiss-army-workflow
/plugin install swiss-army-workflow
```

Comprueba lo instalado con `/plugin list`. Elige **una** vía (symlink *o*
plugin) para no duplicar agents/commands. Ver `docs/ROADMAP.md`.

## Estructura

```
team-claude/
├── CLAUDE.md                 # Memoria global del equipo (se copia a ~/.claude/CLAUDE.md)
├── settings.template.json    # Hooks (cost-tracker, session-save); el installer resuelve rutas
├── agents/                   # 23 subagentes: planner, reviewers por lenguaje, fixers, seguridad...
├── commands/                 # Slash commands: /plan /tdd /parallel-tasks /parallel-review /cost-report ...
├── rules/                    # Reglas siempre-activas: common, python, typescript, react, java, web
├── hooks/                    # (reservado) definiciones de hooks adicionales
├── scripts/                  # cost-tracker.js, session-save.js (Node, sin dependencias)
├── skills/                   # Skills del equipo (bajo demanda). Añade las vuestras aquí.
├── mcp-configs/              # Plantilla de servidores MCP (github, filesystem, postgres)
├── docs/                     # TOKEN-ECONOMY.md y notas
├── install.sh / install.ps1  # Instaladores idempotentes con backup + merge
└── VERSION
```

## Comandos más usados

| Comando | Para qué |
|---------|----------|
| `/plan` | Plan de implementación antes de tocar código |
| `/tdd` | Ciclo test-first |
| `/parallel-tasks "A \| B \| C"` | Ejecuta tareas independientes en paralelo (worktrees + subagentes) |
| `/parallel-review` | Revisa el diff con varios reviewers a la vez y consolida |
| `/code-review` | Revisión de calidad/seguridad del cambio |
| `/build-fix` | Arregla errores de build |
| `/security-scan` | Auditoría de seguridad |
| `/model-route` | Recomienda modelo (haiku/sonnet/opus) por tarea |
| `/cost-report` | Gasto de tokens local por día/modelo/sesión |

## Subagentes destacados

`planner`, `architect`, `code-explorer`, `code-reviewer`, `security-reviewer`,
`silent-failure-hunter`, `tdd-guide`, `refactor-cleaner`, `performance-optimizer`,
`build-error-resolver`, `database-reviewer`, y reviewers/fixers por lenguaje:
`python-reviewer`, `fastapi-reviewer`, `typescript-reviewer`, `react-reviewer`,
`react-build-resolver`, `java-reviewer`, `java-build-resolver`.

## Contribuir al setup

1. Rama + cambios siguiendo los formatos de `CLAUDE.md` (frontmatter de agents,
   `SKILL.md` de skills, matcher específico en hooks).
2. Commits convencionales (`feat(agents):`, `fix(hooks):`, `docs:`).
3. PR. Al mergear, cada dev hace `git pull` (los symlinks propagan al instante).

## Créditos y licencia

Esquema y contenidos base derivados de `everything-claude-code` de Affaan
Mustafa (MIT). Adaptación del equipo bajo la misma licencia. Ver `NOTICE`.
