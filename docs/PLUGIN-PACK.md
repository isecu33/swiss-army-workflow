# Plugin pack del equipo

Nuestro setup **ya cubre** lo esencial (subagentes por lenguaje, `/parallel-*`,
seguridad estática, coste de tokens, plan/TDD). Este pack añade plugins
populares y mantenidos que **llenan huecos**, sin duplicar lo que ya tenemos.

El pack se declara en `settings.template.json` (claves `extraKnownMarketplaces`
y `enabledPlugins`); el instalador lo mergea en tu `~/.claude/settings.json`.
Así el equipo comparte el mismo catálogo al instalar el setup.

> Nota: hoy Claude Code registra el catálogo y la intención vía settings, pero
> la descarga aún no es 100% automática. Tras instalar, ejecuta `/install-pack`
> (o los `/plugin install` de abajo) una vez y reinicia. Comprueba con
> `/plugin list`.

## Marketplaces añadidos

| Marketplace | Repo | Qué es |
|-------------|------|--------|
| `claude-code-plugins` | `anthropics/claude-code` | Directorio oficial de Anthropic |
| `superpowers-marketplace` | `obra/superpowers-marketplace` | Framework de skills de la comunidad (muy popular) |

## Activados por defecto (llenan huecos)

| Plugin | Hueco que cubre |
|--------|-----------------|
| `security-guidance@claude-code-plugins` | Seguridad **en tiempo de edición** (hook PreToolUse que avisa de inyección de comandos, XSS, `eval`, deserialización insegura…). Complementa nuestro `security-reviewer`, que actúa en review. |
| `commit-commands@claude-code-plugins` | Git workflow: `/commit`, `/commit-push-pr`, `/clean_gone`. Encaja con nuestro gitflow y las commit guidelines. |
| `plugin-dev@claude-code-plugins` | Toolkit para desarrollar y validar **nuestro propio plugin** (ahora que el repo se distribuye como plugin). |
| `frontend-design@claude-code-plugins` | Generación de UI de calidad para **React/Next** (design tokens, patrones, evita estética genérica). Teníamos `react-reviewer` pero no generación de diseño. Es el plugin más instalado del directorio oficial. |

Instalación manual equivalente:

```
/plugin marketplace add anthropics/claude-code
/plugin install security-guidance@claude-code-plugins
/plugin install commit-commands@claude-code-plugins
/plugin install plugin-dev@claude-code-plugins
/plugin install frontend-design@claude-code-plugins
```

## Opcionales (actívalos si los quieres)

No los activamos por defecto porque se **solapan** con lo que ya tienes o son
opinables; instálalos a mano si encajan con tu forma de trabajar:

- `superpowers@superpowers-marketplace` — framework de skills (brainstorm, TDD,
  debugging sistemático, sub-agentes). Muy potente pero impone su metodología;
  puede chocar con nuestro flujo. `/plugin install superpowers@superpowers-marketplace`
- `feature-dev@claude-code-plugins` — workflow de feature en 7 fases. Solapa con
  nuestro `/plan` + agentes `code-explorer`/`architect`/`code-reviewer`.
- `pr-review-toolkit@claude-code-plugins` — reviewers de PR (comments, tests,
  tipos…). Solapa con `/parallel-review` y nuestros reviewers por lenguaje.
- `hookify@claude-code-plugins` — crea hooks a partir de la conversación.
- `ralph-wiggum@claude-code-plugins` — loops autónomos de iteración.

## Context7 (MCP, no plugin)

`Context7` (documentación actualizada de librerías en contexto) es un **servidor
MCP**, no un plugin. Si lo queréis, añadidlo a `mcp-configs/` / vuestro
`.mcp.json` en vez de a este pack.

## Cómo quitar algo del pack

Pon el plugin a `false` en `enabledPlugins` de tu `~/.claude/settings.json`
(o del repo si se decide en equipo), o quita el marketplace de
`extraKnownMarketplaces`. Elige **una** vía de instalación (symlink *o* plugin)
para no duplicar comandos/agentes.
