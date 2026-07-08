---
description: Instala el pack de plugins recomendados del equipo (rellena huecos del setup) desde los marketplaces declarados.
---

# /install-pack

Instala el pack de plugins del equipo que complementa este setup. El catálogo ya
está declarado en `~/.claude/settings.json` (`extraKnownMarketplaces` +
`enabledPlugins`); este comando se asegura de que los marketplaces estén
añadidos y los plugins descargados. Detalle y justificación en
`docs/PLUGIN-PACK.md`.

Ejecuta, en orden, y reporta el resultado de cada paso:

```
/plugin marketplace add anthropics/claude-code
/plugin marketplace add obra/superpowers-marketplace
/plugin install security-guidance@claude-code-plugins
/plugin install commit-commands@claude-code-plugins
/plugin install plugin-dev@claude-code-plugins
/plugin install frontend-design@claude-code-plugins
```

Luego:
- Muestra `/plugin list` para confirmar lo instalado.
- Recuerda al usuario reiniciar Claude Code si algún plugin no aparece aún.
- Menciona los opcionales de `docs/PLUGIN-PACK.md` (superpowers, feature-dev,
  pr-review-toolkit, hookify) por si quiere activarlos, sin instalarlos por
  defecto (se solapan con el setup).

No instales plugins fuera de la lista sin confirmación del usuario.
