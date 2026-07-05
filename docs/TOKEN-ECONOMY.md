# Economía de tokens

El objetivo es que el contexto que se paga siempre sea pequeño, y que el trabajo
caro corra aislado. Cuatro palancas:

## 1. Carga por niveles

- **Rules** (`rules/`) y **CLAUDE.md**: siempre en contexto → manténlos mínimos
  y de alto valor. Si una regla solo aplica a un lenguaje, vive en
  `rules/<lenguaje>/`, no en `common`.
- **Skills** (`skills/`): solo se cargan cuando se invocan. Mete aquí el
  conocimiento de dominio extenso en vez de en CLAUDE.md.
- **Agents** (`agents/`): corren con su **propio** contexto. Lo que lean o
  generen **no** contamina el hilo principal. Delegar = ahorrar contexto.
- **Commands** (`commands/`): plantillas de flujo que solo se expanden al usarse.

## 2. Delegación agresiva

Revisiones, exploración y auditorías → subagentes. El hilo principal solo
orquesta y consolida. Pásale a cada subagente **solo** el fragmento y las reglas
que necesita, nunca el repo entero.

## 3. Enrutado de modelo (`/model-route`)

| Modelo | Uso | Coste relativo |
|--------|-----|----------------|
| `haiku` | Cambios mecánicos deterministas, formateo, renombrados | Bajo |
| `sonnet` | Implementación e integración por defecto | Medio |
| `opus` | Arquitectura, revisión profunda, requisitos ambiguos | Alto |

No escales a `opus` sin necesidad real de razonamiento. Para refactors
deterministas, baja a `haiku`.

## 4. Medición (`/cost-report`)

El hook `scripts/cost-tracker.js` (Stop hook) suma tokens por sesión desde el
transcript y escribe una fila en `~/.claude/metrics/costs.jsonl`. `/cost-report`
agrega por día, modelo y sesión (toma la última fila por `session_id`).

Rutina sugerida: revisar `/cost-report` semanalmente; si un tipo de tarea
dispara el gasto, mover su conocimiento a una skill (carga bajo demanda) o
bajar el modelo por defecto para ese flujo.

## Antipatrones a evitar

- Meter guías largas en CLAUDE.md (coste fijo permanente) → llévalas a skills.
- Hacer revisiones en el hilo principal en vez de delegar → contamina y encarece.
- Leer archivos completos sin Grep/Glob previo.
- Usar `opus` por defecto.
- Paralelizar tareas que comparten archivos (genera conflictos y retrabajo caro).
