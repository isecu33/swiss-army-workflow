---
description: Instala el pack de plugins recomendados del equipo (rellena huecos del setup) desde los marketplaces declarados.
---

# /install-pack

Instala el pack de plugins del equipo que complementa este setup. El catalogo ya
esta declarado en `~/.claude/settings.json` (`extraKnownMarketplaces` +
`enabledPlugins`); este comando se asegura de que los marketplaces esten
anadidos y los plugins descargados. Detalle y justificacion en
`docs/PLUGIN-PACK.md`.

Ejecuta, en orden, y reporta el resultado de cada paso:

```
/plugin marketplace add anthropics/claude-code
/plugin marketplace add egorfedorov/claude-context-optimizer
/plugin marketplace add thedotmack/claude-mem
/plugin install security-guidance@claude-code-plugins
/plugin install commit-commands@claude-code-plugins
/plugin install plugin-dev@claude-code-plugins
/plugin install frontend-design@claude-code-plugins
/plugin install claude-context-optimizer@cco
/plugin install claude-mem
```

Luego:
- Muestra `/plugin list` para confirmar lo instalado.
- Avisa que **claude-mem** arranca un worker local (Bun + `uv`, puerto 37777) la
  primera vez; si el usuario quiere memoria ligera o **cross-app** (que tambien
  aplique en la app de Claude), senalale el MCP `memory` de
  `mcp-configs/.mcp.json.template` en vez del plugin. Ver `docs/PLUGIN-PACK.md`.
- Recuerda reiniciar Claude Code si algun plugin no aparece aun.
- Menciona los opcionales de `docs/PLUGIN-PACK.md` (superpowers, feature-dev,
  pr-review-toolkit, hookify) por si quiere activarlos, sin instalarlos por
  defecto (se solapan con el setup).

No instales plugins fuera de la lista sin confirmacion del usuario.
