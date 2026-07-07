# Roadmap de modernización

Recomendaciones para llevar este setup al nivel de las últimas novedades de
Claude Code (digest oficial hasta la semana 26, junio 2026) y las publicaciones
de ingeniería de Anthropic. Cada punto indica **qué es**, **qué hacer** y
**quién lo hace**: 🟢 ya cubierto · 🛠️ implementable en este repo · 👤 acción
tuya/del equipo en Claude Code o GitHub.

Prioridad: **P1** alto impacto/bajo esfuerzo · **P2** valioso · **P3** opcional.

## P1 — Hacer ya

1. 🛠️ **Empaquetado como plugin + marketplace** *(hecho en esta rama)*.
   Los plugins son hoy el mecanismo canónico para compartir setups en equipo.
   Además del instalador por symlink, el equipo puede instalarlo así:
   ```
   /plugin marketplace add isecu33/swiss-army-workflow
   /plugin install swiss-army-workflow
   ```
   Ventaja: versionado, updates con un comando y `/plugin list` para auditar.

2. 👤 **Auto mode** para el trabajo en paralelo. Un clasificador aprueba las
   acciones seguras y bloquea las de riesgo en segundo plano, en vez de pedir
   permiso a cada paso — ideal con `/parallel-tasks`. Disponible en Pro y en
   Bedrock/Google Cloud/Microsoft Foundry. Actívalo por sesión y define reglas
   *hard deny* para lo irreversible.

3. 👤 **Instalar plugins oficiales complementarios** desde el marketplace de
   Anthropic (no reinventarlos aquí):
   - `security-guidance` — hook que avisa de patrones inseguros (inyección de
     comandos, XSS, `eval`, deserialización insegura…) mientras Claude edita.
   - `pr-review-toolkit` / `code-review` — revisión de PR con agentes en
     paralelo y filtrado por confianza; encaja con nuestro `/parallel-review`.

4. 🟢 **Checkpoints + `/rewind`**. Claude Code guarda el estado del código antes
   de cada cambio; puedes volver atrás con doble `Esc` o `/rewind` (incluso a
   antes de un `/clear`). Combínalo siempre con git en tareas amplias. Ya
   documentado en el flujo; solo recuérdalo al equipo.

5. 👤 **`/usage`** para ver el consumo del plan desglosado por skill, subagente,
   plugin y MCP. Complementa nuestro `/cost-report` (coste local por tokens).

## P2 — Siguiente iteración

6. 🛠️ **`fallbackModel` y política de effort en `settings.json`**. Claude Code
   permite configurar hasta tres modelos de reserva y niveles de *effort*
   (`/effort`, `xhigh` para lo más duro). Añadir un `fallbackModel` por defecto
   y documentar `xhigh` para arquitectura encaja con `/model-route`.
   *(Verificar el nombre/forma exactos de la clave en la doc antes de fijarla.)*

7. 🛠️ **Hook `Notification`** para trabajo autónomo/en segundo plano: avisar
   (sonido/desktop) cuando una sesión termina o necesita input. Los subagentes
   en background disparan este evento.

8. 👤 **Worktrees nativos** (`worktree.baseRef`). Claude Code ya integra git
   worktrees y elige si ramifican del remoto por defecto o de `HEAD` local.
   Nuestro `/parallel-tasks` puede apoyarse en esto en vez de crear worktrees a
   mano — migración recomendada cuando lo adoptéis.

9. 👤 **Vista de agentes** (`claude agents`) y **sesiones en background**. Una
   pantalla con lo que corre, lo bloqueado y lo hecho; las sesiones en segundo
   plano aparecen en `/resume` si las fijas. Muy útil para orquestar varias
   tareas a la vez.

10. 👤 **`/goal`** para que Claude siga trabajando entre turnos hasta cumplir una
    condición de fin — encaja con features largas.

11. 🛠️ **Output styles** como primitivo de plugin. Se pueden empaquetar estilos
    de salida (p. ej. modo explicativo en onboarding). Añadir uno del equipo es
    opcional pero diferencia el setup.

## P3 — Explorar

12. 👤 **Dynamic workflows**: Claude escribe un script que orquesta de docenas a
    cientos de subagentes; los subagentes pueden lanzar subagentes (máx. 5
    niveles). Para refactors masivos o barridos, va más allá de `/parallel-tasks`.

13. 👤 **`/ultrareview` / `claude ultrareview`**: flota de agentes cazabugs en la
    nube cuyos hallazgos vuelven al CLI/CI. Útil como gate de calidad pesado.

14. 👤 **`/team-onboarding`**: empaqueta tu configuración en una guía reproducible
    para nuevos miembros — complementa nuestro `/setup-check` y el README.

15. 👤 **`claude mcp login` / `logout`**: autentica servidores MCP desde el shell
    en vez del menú `/mcp`. Menciónalo en `mcp-configs/` cuando conectéis MCPs.

16. 👤 **Extensión nativa de VS Code** y **Windows sin Git Bash** (usa PowerShell
    como shell). Bajad la extensión quienes trabajéis en IDE; nuestro
    `install.ps1` ya cubre Windows.

## Principio rector (context engineering)

Todas estas piezas comparten una regla que Anthropic repite: *el contexto se
llena rápido y el rendimiento cae al llenarse*. Por eso el norte sigue siendo el
mismo — delegar en subagentes, cargar skills/agents bajo demanda y mantener
`rules`/`CLAUDE.md` mínimos. Ver `docs/TOKEN-ECONOMY.md`.

## Fuentes

- Claude Code — What's new (digest semanal): https://code.claude.com/docs/en/whats-new
- Enabling Claude Code to work more autonomously: https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously
- Plugins oficiales de Claude Code: https://github.com/anthropics/claude-code/blob/main/plugins/README.md
- Effective context engineering for AI agents: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Equipping agents with Agent Skills: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
