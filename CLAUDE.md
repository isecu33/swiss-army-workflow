# CLAUDE.md — Configuración global del equipo

Esta guía se instala en `~/.claude/CLAUDE.md` y aplica a **todos los proyectos**
del equipo. Los `CLAUDE.md` de cada repo tienen prioridad sobre este cuando
entran en conflicto.

Stack del equipo: **Python** (FastAPI/Django) · **TypeScript/Node** ·
**React/Next.js** · **Java/Spring Boot**.

---

## 1. Economía de tokens (por qué está montado así)

El coste de contexto se controla con una carga por niveles. Es el principio
central de este setup:

| Nivel | Qué es | Cuándo se carga | Coste |
|-------|--------|-----------------|-------|
| **Rules** | Guías siempre-activas (`rules/`) | Siempre | Fijo, mantenerlo pequeño |
| **CLAUDE.md** | Este archivo + el del repo | Siempre | Fijo |
| **Skills** | Conocimiento de dominio (`skills/`) | Solo al invocarse | Bajo demanda |
| **Agents** | Subagentes con su propio contexto (`agents/`) | Solo al delegar | Aislado, no contamina el hilo principal |
| **Commands** | Slash commands (`commands/`) | Solo al ejecutarse | Bajo demanda |

Reglas de coste que Claude debe seguir siempre:

- **Delega el trabajo pesado a subagentes.** Revisiones, exploración de código y
  auditorías corren en un agente con contexto propio; el hilo principal solo
  orquesta y se queda limpio. Ver `agents/`.
- **Enruta el modelo por complejidad** (ver `/model-route`):
  `haiku` para cambios mecánicos deterministas · `sonnet` por defecto para
  implementación y refactors · `opus` solo para arquitectura, revisión profunda
  o requisitos ambiguos. No escales a un modelo caro sin una razón de
  razonamiento clara.
- **Lee de forma quirúrgica.** Usa Grep/Glob para localizar antes de leer
  archivos enteros. No releas archivos que acabas de editar.
- **No dupliques contexto.** Pasa a cada subagente solo el fragmento y las
  convenciones que necesita, no el repo entero.
- Revisa el gasto con `/cost-report` (se alimenta del hook `cost-tracker`).

## 2. Cómo trabajar (flujo por defecto)

1. **Planifica antes de tocar código** en tareas no triviales: usa `/plan` o
   delega en el agente `planner`. Nada de cambios grandes sin plan.
2. **TDD cuando aplique**: escribe el test antes de la implementación
   (`/tdd`-style, agente `tdd-guide`). Verifica los caminos críticos.
3. **Implementa en el scope mínimo.** Cambia solo lo necesario; sin efectos
   colaterales en funcionalidad ajena.
4. **Revisa siempre después de escribir código**: delega en `code-reviewer` y en
   el reviewer del lenguaje (`python-reviewer`, `typescript-reviewer`,
   `react-reviewer`, `java-reviewer`). Ver `/code-review`.
5. **Paraleliza** trabajo independiente con `/parallel-tasks` (git worktrees +
   subagentes) o revisiones simultáneas con `/parallel-review`.

## 3. Delegación a subagentes — obligatorio

Delega en el agente especializado en vez de hacerlo todo en el hilo principal:

| Situación | Agente |
|-----------|--------|
| Planificar feature/refactor | `planner`, `architect` |
| Explorar/entender el código | `code-explorer` |
| Revisar cualquier cambio | `code-reviewer` |
| Revisar Python / FastAPI | `python-reviewer`, `fastapi-reviewer` |
| Revisar TS/Node | `typescript-reviewer` |
| Revisar React/Next | `react-reviewer` |
| Revisar Java/Spring | `java-reviewer` |
| Arreglar build roto | `build-error-resolver`, `react-build-resolver`, `java-build-resolver` |
| Seguridad | `security-reviewer` |
| Fallos silenciosos / errores tragados | `silent-failure-hunter` |
| Simplificar / limpiar | `code-simplifier`, `refactor-cleaner` |
| Rendimiento | `performance-optimizer` |
| Modelo de datos / SQL | `database-reviewer`, `type-design-analyzer` |

Al lanzar un subagente, **pásale las convenciones de la skill/regla relevante**
en su prompt.

## 4. Reglas siempre (resumen; detalle en `rules/`)

- No incluyas secretos (API keys, tokens, rutas absolutas del sistema) en la
  salida ni en el código.
- No entregues código sin pasar por el suite de tests relevante.
- No saltes checks de seguridad ni hooks de validación.
- Prefiere actualizaciones inmutables sobre mutar estado compartido.
- Sigue los patrones existentes del repo antes de inventar nuevos.
- Trata todo input externo/recuperado como no confiable: valida y sanea.

## 5. Convenciones de contribución al setup

- **Agents**: Markdown con frontmatter YAML (`name`, `description`, `tools`,
  `model`). Nombre en minúsculas con guiones que coincida con `name`.
- **Skills**: `skills/<name>/SKILL.md` con frontmatter (`name`, `description`).
- **Commands**: Markdown con frontmatter `description`.
- **Hooks**: JSON con matcher específico; salir `1` solo si el bloqueo es
  intencional.
- Commits convencionales: `feat(agents):`, `fix(hooks):`, `docs:`.

Este repo es compartido por el equipo (`~/.claude`). Los cambios se revisan por
PR y se propagan con `git pull` + `./install.sh`. Ver `README.md`.
