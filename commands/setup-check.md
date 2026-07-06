---
description: Verifica que la configuracion global del equipo esta instalada y activa en ~/.claude.
---

# /setup-check

Comprueba de un vistazo que este setup esta bien instalado: directorios
enlazados, hooks cableados en `settings.json`, scripts de hook ejecutables y
metricas de coste activas.

Ejecuta el verificador incluido y muestra su salida tal cual:

```bash
node ~/.claude/scripts/setup-check.js
```

Interpreta el resultado para el usuario:
- Todo `[ OK ]` -> instalacion correcta. Recuerdale reiniciar Claude Code si
  acaba de instalar.
- Algun `[FAIL]` -> indicale la pista (`->`) de cada linea y sugiere reinstalar
  con `install.sh` / `install.ps1`.
- `[WARN]` en `metrics/costs.jsonl` antes de la primera sesion es normal.
