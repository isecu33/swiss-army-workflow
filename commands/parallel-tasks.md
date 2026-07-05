---
description: Ejecuta varias tareas independientes en paralelo, cada una en su propio git worktree y subagente aislado, y luego integra los resultados.
argument-hint: "tarea A | tarea B | tarea C"  (separadas por |)
---

# /parallel-tasks — Ejecución paralela con git worktrees

Divide trabajo **independiente** en ramas aisladas y lo ejecuta en paralelo con
subagentes, sin que un flujo pise a otro y sin contaminar el contexto principal.
Autocontenido: solo usa `git worktree` y el tool `Task` de Claude Code (no
requiere runtime externo).

**Tarea(s):** $ARGUMENTS

---

## Cuándo usarlo

- Varias features/fixes que **no dependen entre sí** y tocan zonas distintas.
- Necesitas explorar 2-3 enfoques de la misma tarea en paralelo y comparar.
- Refactors amplios divisibles por módulo/paquete.

Si las tareas comparten archivos o hay dependencias fuertes, **no** paralelices:
usa `/plan` y ejecútalas en orden.

## Protocolo

### Fase 0 — Descomposición y chequeo de independencia
1. Parsea `$ARGUMENTS` en N sub-tareas (separadas por `|`). Si viene una sola
   descripción grande, descomponla tú en piezas independientes y **confírmalas
   con el usuario** antes de seguir.
2. Verifica que no se solapen en archivos clave (Grep/Glob rápido). Si se
   solapan, avisa y propón secuenciar las que colisionan.
3. Asigna modelo por complejidad (ver `/model-route`): mecánico→haiku,
   implementación→sonnet, ambiguo/arquitectura→opus.

### Fase 1 — Crear worktrees aislados
Para cada sub-tarea `i` con un slug corto (p.ej. `auth`, `cache`, `ui-table`):

```bash
git worktree add -b feat/<slug-i> ../wt-<slug-i> HEAD
```

Cada worktree es una copia de trabajo independiente sobre su propia rama, así
los subagentes no compiten por el mismo árbol.

### Fase 2 — Lanzar subagentes en paralelo
Lanza **un `Task` por sub-tarea en el mismo bloque** (ejecución concurrente).
En cada prompt de subagente incluye:
- La descripción de la sub-tarea y su criterio de aceptación.
- La ruta de su worktree: `../wt-<slug-i>` (debe hacer `cd` allí y trabajar solo ahí).
- Las convenciones de la regla/skill relevante del stack
  (`rules/python`, `rules/typescript`, `rules/react`, `rules/java`).
- Instrucción de correr lint/typecheck/tests de su scope antes de terminar.
- Que devuelva: resumen de cambios, archivos tocados, y estado de tests.

Sugerencia de `subagent_type`:
- Implementación → `general-purpose`.
- Exploración previa amplia → `Explore`.
- Diseño de estrategia → `Plan`.

### Fase 3 — Revisión paralela (opcional pero recomendado)
Cuando los subagentes terminen, delega revisión de cada diff al reviewer del
lenguaje correspondiente (`python-reviewer`, `typescript-reviewer`,
`react-reviewer`, `java-reviewer`) + `security-reviewer` para superficies
sensibles. Ver `/parallel-review`.

### Fase 4 — Integración
1. Muestra al usuario un resumen por rama (cambios, tests, hallazgos de review).
2. Con su OK, integra en orden seguro:
   ```bash
   git checkout <rama-base>
   git merge --no-ff feat/<slug-i>   # o abre PR por rama
   ```
3. Resuelve conflictos si aparecen (aquí sí, de forma secuencial).
4. Limpia los worktrees:
   ```bash
   git worktree remove ../wt-<slug-i>
   ```

### Fase 5 — Reporte final

```markdown
## Ejecución paralela — resumen
| Rama | Tarea | Archivos | Tests | Review | Estado |
|------|-------|----------|-------|--------|--------|
| feat/auth | ... | 4 | pass | 0 crit | merged |
```

## Reglas clave
1. **Solo trabajo independiente en paralelo.** Lo dependiente va secuencial.
2. **Cada subagente vive en su worktree**; nunca escriben en el árbol principal.
3. **Integración secuencial y revisada**; la velocidad está en fases 1-3.
4. Limpia siempre los worktrees al terminar.
5. Ante conflicto grave, para y pregunta al usuario.
