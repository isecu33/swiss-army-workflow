# Plugin pack del equipo

Nuestro setup **ya cubre** lo esencial (subagentes por lenguaje, `/parallel-*`,
seguridad estatica, coste de tokens, plan/TDD). Este pack anade plugins
populares y mantenidos que **llenan huecos**, sin duplicar lo que ya tenemos.

El pack se declara en `settings.template.json` (claves `extraKnownMarketplaces`
y `enabledPlugins`); el instalador lo mergea en tu `~/.claude/settings.json`.
Asi el equipo comparte el mismo catalogo al instalar el setup.

> Nota: hoy Claude Code registra el catalogo y la intencion via settings, pero
> la descarga aun no es 100% automatica. Tras instalar, ejecuta `/install-pack`
> (o los `/plugin install` de abajo) una vez y reinicia. Comprueba con
> `/plugin list`.

## Marketplaces anadidos

| Marketplace | Repo | Que es |
|-------------|------|--------|
| `claude-code-plugins` | `anthropics/claude-code` | Directorio oficial de Anthropic |
| `superpowers-marketplace` | `obra/superpowers-marketplace` | Framework de skills de la comunidad (muy popular) |
| `cco` | `egorfedorov/claude-context-optimizer` | Optimizacion de tokens/contexto |
| `thedotmack` | `thedotmack/claude-mem` | Memoria persistente entre sesiones |

## Activados por defecto (llenan huecos)

| Plugin | Hueco que cubre |
|--------|-----------------|
| `security-guidance@claude-code-plugins` | Seguridad **en tiempo de edicion** (hook PreToolUse que avisa de inyeccion de comandos, XSS, `eval`, deserializacion insegura...). Complementa nuestro `security-reviewer`, que actua en review. |
| `commit-commands@claude-code-plugins` | Git workflow: `/commit`, `/commit-push-pr`, `/clean_gone`. Encaja con nuestro gitflow y las commit guidelines. |
| `plugin-dev@claude-code-plugins` | Toolkit para desarrollar y validar **nuestro propio plugin** (ahora que el repo se distribuye como plugin). |
| `frontend-design@claude-code-plugins` | Generacion de UI de calidad para **React/Next** (design tokens, patrones, evita estetica generica). Teniamos `react-reviewer` pero no generacion de diseno. Es el plugin mas instalado del directorio oficial. |
| `claude-context-optimizer@cco` | **Optimizacion de tokens**: Read Cache (bloquea re-lecturas), `.contextignore`, auto-compact al 80%, avisos de presupuesto y `/cco` (panel de contexto). Local, sin telemetria, MIT. Complementa nuestro `/cost-report`. |
| `claude-mem@thedotmack` | **Memoria a largo plazo**: captura observaciones por sesion, las comprime y reinyecta contexto relevante en sesiones futuras. Busqueda en 3 capas (~10x ahorro de tokens al filtrar antes de traer detalle). Es el plugin de memoria mas popular. |

Instalacion manual equivalente:

```
/plugin marketplace add anthropics/claude-code
/plugin install security-guidance@claude-code-plugins
/plugin install commit-commands@claude-code-plugins
/plugin install plugin-dev@claude-code-plugins
/plugin install frontend-design@claude-code-plugins

/plugin marketplace add egorfedorov/claude-context-optimizer
/plugin install claude-context-optimizer@cco

/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

> **claude-mem** necesita un worker local (Bun + `uv`, puerto 37777) que el
> instalador del plugin arranca automaticamente. Es mas pesado que el resto; si
> prefieres algo ligero, mira las alternativas de memoria mas abajo.

## Memoria a largo plazo - opciones

| Opcion | Tipo | Donde funciona | Notas |
|--------|------|----------------|-------|
| `claude-mem@thedotmack` | Plugin | **Solo Claude Code** (+ skill opcional para buscar desde Claude Desktop) | Captura automatica, worker local, el mas popular |
| `claude-mem-lite` (`sdsrss/claude-mem-lite`) | MCP/plugin | Claude Code | Ligero, SQLite local, sin servicios externos; ~600x mas barato |
| `memory` (`@modelcontextprotocol/server-memory`) | **MCP** | **Claude Code y la app de Claude** | Grafo de conocimiento local, sin credenciales. Ya esta en `mcp-configs/.mcp.json.template`. Es la opcion **cross-app** |
| `mem0` | **MCP** | Claude Code y la app de Claude | Capa de memoria en la nube (API key); free tier 10k memorias |

Por defecto activamos `claude-mem` (potencia + popularidad). Si quieres memoria
que **tambien** aplique en la app de Claude, usa el MCP `memory` (o `mem0`) en
lugar del plugin - ver la seccion de abajo sobre plugin vs MCP.

## Optimizacion de tokens

Ademas del `claude-context-optimizer@cco` (activado por defecto), recuerda las
palancas nativas de Claude Code: prompt caching automatico, auto-compact,
`/compact`, skills bajo demanda y `CLAUDE.md` < 200 lineas. Nuestro `/cost-report`
y `docs/TOKEN-ECONOMY.md` cubren la medicion y los principios. Alternativa MCP:
`token-optimizer-mcp` (`ooples/token-optimizer-mcp`) si prefieres la optimizacion
como servidor MCP en vez de plugin.

## Opcionales (activalos si los quieres)

No los activamos por defecto porque se **solapan** con lo que ya tienes o son
opinables; instalalos a mano si encajan con tu forma de trabajar:

- `superpowers@superpowers-marketplace` - framework de skills (brainstorm, TDD,
  debugging sistematico, sub-agentes). Muy potente pero impone su metodologia;
  puede chocar con nuestro flujo. `/plugin install superpowers@superpowers-marketplace`
- `feature-dev@claude-code-plugins` - workflow de feature en 7 fases. Solapa con
  nuestro `/plan` + agentes `code-explorer`/`architect`/`code-reviewer`.
- `pr-review-toolkit@claude-code-plugins` - reviewers de PR (comments, tests,
  tipos...). Solapa con `/parallel-review` y nuestros reviewers por lenguaje.
- `hookify@claude-code-plugins` - crea hooks a partir de la conversacion.
- `ralph-wiggum@claude-code-plugins` - loops autonomos de iteracion.

## Context7 (MCP, no plugin)

`Context7` (documentacion actualizada de librerias en contexto) es un **servidor
MCP**, no un plugin. Si lo quereis, anadidlo a `mcp-configs/` / vuestro
`.mcp.json` en vez de a este pack.

## Plugin o MCP? Afecta a la app de Claude?

Esta es la duda clave:

- **Plugins** (agents, commands, hooks, skills empaquetados) -> **solo Claude
  Code** (CLI e IDE). No afectan a la app de Claude (web/desktop) ni a Cowork.
  Por eso `claude-context-optimizer` y `claude-mem` actuan **solo mientras
  programas con Claude Code**. *(Excepcion menor: claude-mem trae una skill
  opcional para buscar su memoria desde Claude Desktop, pero la captura ocurre en
  Claude Code.)*
- **Servidores MCP** -> funcionan en Claude Code **y** pueden anadirse como
  **conector** en la app de Claude. Si quieres que la memoria o una herramienta
  este disponible tambien en la app, va como MCP, no como plugin.
- **La app de Claude** tiene ademas su **propia** funcion de memoria integrada,
  independiente de todo esto.

Regla practica: memoria/tooling **solo para programar** -> plugin; memoria/tooling
**compartido con la app de Claude** -> MCP.

## Como quitar algo del pack

Pon el plugin a `false` en `enabledPlugins` de tu `~/.claude/settings.json`
(o del repo si se decide en equipo), o quita el marketplace de
`extraKnownMarketplaces`. Elige **una** via de instalacion (symlink *o* plugin)
para no duplicar comandos/agentes.
