---
description: Lanza revisiones de código en paralelo con varios subagentes especializados sobre el diff actual, y consolida un único veredicto.
argument-hint: "[ref git opcional, p.ej. main...HEAD]"
---

# /parallel-review — Revisión multi-agente en paralelo

Revisa el cambio actual disparando **varios reviewers a la vez**, cada uno en su
propio contexto aislado, y luego fusiona los hallazgos en un solo reporte
priorizado. Ahorra tokens (el hilo principal solo orquesta) y tiempo.

**Alcance:** $ARGUMENTS  (por defecto: `git diff` + `git diff --staged`)

---

## Protocolo

### Fase 0 — Detectar el alcance y los lenguajes tocados
1. `git diff --name-only` (y `--staged`) para listar archivos cambiados.
2. Clasifica por lenguaje/superficie:
   - `*.py` → `python-reviewer` (+ `fastapi-reviewer` si hay FastAPI)
   - `*.ts`, `*.js`, backend Node → `typescript-reviewer`
   - `*.tsx`, `*.jsx`, `components/**` → `react-reviewer`
   - `*.java`, Spring → `java-reviewer`
   - SQL / migraciones / modelos → `database-reviewer`
   - Cualquier superficie sensible (auth, entrada de usuario, secretos) → `security-reviewer`
3. Siempre incluye `code-reviewer` (transversal) y, si el diff toca I/O o
   promesas, `silent-failure-hunter`.

### Fase 1 — Lanzar en paralelo
Lanza **todos los `Task` de review en el mismo bloque** para que corran
concurrentemente. A cada reviewer pásale:
- El diff relevante a su lenguaje (no todo el repo).
- Las convenciones de su `rules/<lenguaje>`.
- Instrucción de filtrar por confianza (>80%), citar archivo:línea, y no
  inflar severidades (cero hallazgos es un resultado válido).

### Fase 2 — Consolidar
Fusiona los reportes en una sola tabla, deduplicando hallazgos repetidos entre
reviewers y ordenando por severidad:

```markdown
## Review consolidada
| Sev | Archivo:línea | Hallazgo | Reviewer | Fix |
|-----|---------------|----------|----------|-----|
| CRITICAL | ... | ... | security-reviewer | ... |

### Veredicto
- CRITICAL: N → BLOCK / HIGH: N → WARN / limpio → APPROVE
```

### Fase 3 — Siguiente paso
- Si hay CRITICAL/HIGH: ofrece arreglarlos (delegando a los agentes de fix) o
  listar tareas.
- Si limpio: aprueba explícitamente. No inventes hallazgos para "parecer riguroso".

## Reglas clave
1. Un reviewer por lenguaje/superficie, **todos en paralelo**.
2. Cada uno recibe solo su porción del diff + sus reglas (economía de tokens).
3. Dedup y prioriza; un único veredicto claro.
4. Cero hallazgos = APPROVE válido.
