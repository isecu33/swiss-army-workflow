---
description: Flujo TDD — escribe el test primero, ve el fallo, implementa el mínimo, refactoriza en verde.
argument-hint: "[qué implementar]"
---

# /tdd — Test-Driven Development

Implementa `$ARGUMENTS` siguiendo el ciclo rojo-verde-refactor. Para trabajo no
trivial delega en el agente `tdd-guide` pasándole las convenciones de
`rules/<lenguaje>/testing.md`.

## Ciclo
1. **Rojo** — Escribe el test que describe el comportamiento deseado (feliz +
   bordes). Ejecútalo y confirma que **falla** por la razón correcta.
2. **Verde** — Implementa lo mínimo para pasar el test. Nada más.
3. **Refactor** — Limpia con los tests en verde; sin cambiar comportamiento.
4. **Repite** por cada caso/criterio de aceptación.

## Por stack
- **Python**: `pytest`, `pytest --cov=app --cov-report=term-missing`.
- **TS/Node**: `vitest`/`jest`; cubre tipos y caminos async.
- **React**: React Testing Library; testea comportamiento, no implementación.
- **Java/Spring**: JUnit 5 + Mockito; `@SpringBootTest` solo para integración.

## Reglas
- No escribas implementación antes que su test.
- Verifica siempre los caminos críticos.
- Objetivo de cobertura útil (no vanidad): prioriza lógica y bordes.
- Al terminar, delega en `/parallel-review` o el reviewer del lenguaje.
