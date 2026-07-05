#!/usr/bin/env bash
# install.sh — Instala/actualiza la config del equipo en ~/.claude (macOS/Linux).
#
# Estrategia: symlinks desde ~/.claude/{agents,commands,rules,skills,scripts}
# hacia este repo, para que un `git pull` propague cambios sin reinstalar.
# CLAUDE.md y settings.json se COPIAN (mergeando settings de forma segura).
#
# Uso:
#   ./install.sh            # instala con symlinks (recomendado)
#   ./install.sh --copy     # copia en vez de symlink (para máquinas sin symlink)
#   ./install.sh --dry-run  # muestra lo que haría, sin tocar nada
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
MODE="link"; DRY=0
for a in "$@"; do
  case "$a" in
    --copy) MODE="copy" ;;
    --dry-run) DRY=1 ;;
    *) echo "Arg desconocido: $a"; exit 1 ;;
  esac
done

log() { echo "[team-claude] $*"; }
run() { if [ "$DRY" = 1 ]; then echo "DRY: $*"; else eval "$@"; fi; }

log "Repo:   $REPO_DIR"
log "Destino: $CLAUDE_DIR   (modo: $MODE)"
run "mkdir -p \"$CLAUDE_DIR\""

# Backup si ya existe algo
STAMP="$(date +%Y%m%d-%H%M%S)"
backup() {
  local target="$1"
  if [ -e "$target" ] || [ -L "$target" ]; then
    run "mv \"$target\" \"$target.bak-$STAMP\""
    log "backup: $(basename "$target") -> $(basename "$target").bak-$STAMP"
  fi
}

link_dir() {
  local name="$1"
  backup "$CLAUDE_DIR/$name"
  if [ "$MODE" = "link" ]; then
    run "ln -s \"$REPO_DIR/$name\" \"$CLAUDE_DIR/$name\""
  else
    run "cp -r \"$REPO_DIR/$name\" \"$CLAUDE_DIR/$name\""
  fi
  log "instalado: $name"
}

for d in agents commands rules skills scripts; do
  [ -d "$REPO_DIR/$d" ] && link_dir "$d"
done

# CLAUDE.md global (copiado, para que el usuario pueda añadir notas locales encima)
backup "$CLAUDE_DIR/CLAUDE.md"
run "cp \"$REPO_DIR/CLAUDE.md\" \"$CLAUDE_DIR/CLAUDE.md\""
log "instalado: CLAUDE.md"

# settings.json — genera desde la plantilla con la ruta real y mergea si ya existe
TEMPLATE="$REPO_DIR/settings.template.json"
TARGET="$CLAUDE_DIR/settings.json"
if [ -f "$TEMPLATE" ]; then
  RENDERED_FILE="$(mktemp)"
  sed "s#{{CLAUDE_DIR}}#$CLAUDE_DIR#g" "$TEMPLATE" > "$RENDERED_FILE"
  if [ "$DRY" = 1 ]; then
    echo "DRY: escribiría settings.json (hooks) en $TARGET"
  elif command -v node >/dev/null 2>&1 && [ -f "$TARGET" ]; then
    # Merge no destructivo: conserva las claves existentes, añade/actualiza hooks.
    node -e '
      const fs=require("fs");
      const targetPath=process.argv[1], renderedFile=process.argv[2];
      let cur={}; try{cur=JSON.parse(fs.readFileSync(targetPath,"utf8"))}catch{}
      const add=JSON.parse(fs.readFileSync(renderedFile,"utf8"));
      cur.hooks=Object.assign({}, cur.hooks, add.hooks);
      if(add["$schema"]&&!cur["$schema"]) cur["$schema"]=add["$schema"];
      fs.writeFileSync(targetPath, JSON.stringify(cur,null,2)+"\n");
    ' "$TARGET" "$RENDERED_FILE"
    log "settings.json mergeado (hooks)"
  else
    cp "$RENDERED_FILE" "$TARGET"
    log "settings.json escrito"
  fi
  rm -f "$RENDERED_FILE"
fi

log "Listo. Reinicia Claude Code para carg