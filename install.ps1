# install.ps1 — Instala/actualiza la config del equipo en ~/.claude (Windows).
#
#   .\install.ps1              # symlinks (requiere Modo Desarrollador o admin)
#   .\install.ps1 -Copy        # copia en vez de symlink
#   .\install.ps1 -DryRun      # muestra lo que haría
param([switch]$Copy, [switch]$DryRun)

$ErrorActionPreference = "Stop"
$RepoDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$Stamp     = Get-Date -Format "yyyyMMdd-HHmmss"

function Log($m) { Write-Host "[team-claude] $m" }
function Backup($t) {
  if (Test-Path $t) {
    if ($DryRun) { Log "DRY backup: $t" }
    else { Move-Item $t "$t.bak-$Stamp"; Log "backup: $(Split-Path $t -Leaf)" }
  }
}

Log "Repo:    $RepoDir"
Log "Destino: $ClaudeDir"
if (-not (Test-Path $ClaudeDir)) {
  if ($DryRun) { Log "DRY mkdir $ClaudeDir" } else { New-Item -ItemType Directory -Path $ClaudeDir | Out-Null }
}

foreach ($d in @("agents","commands","rules","skills","scripts")) {
  $src = Join-Path $RepoDir $d
  $dst = Join-Path $ClaudeDir $d
  if (-not (Test-Path $src)) { continue }
  Backup $dst
  if ($DryRun) { Log "DRY install $d"; continue }
  if ($Copy) { Copy-Item $src $dst -Recurse }
  else {
    try { New-Item -ItemType SymbolicLink -Path $dst -Target $src | Out-Null }
    catch { Log "symlink falló, copiando $d (activa Modo Desarrollador para symlinks)"; Copy-Item $src $dst -Recurse }
  }
  Log "instalado: $d"
}

# CLAUDE.md
$claudeMd = Join-Path $ClaudeDir "CLAUDE.md"
Backup $claudeMd
if (-not $DryRun) { Copy-Item (Join-Path $RepoDir "CLAUDE.md") $claudeMd; Log "instalado: CLAUDE.md" }

# settings.json desde plantilla (sustituye {{CLAUDE_DIR}}) + merge si existe
$template = Join-Path $RepoDir "settings.template.json"
$target   = Join-Path $ClaudeDir "settings.json"
if (Test-Path $template) {
  $claudeDirJson = $ClaudeDir -replace '\\','/'
  $rendered = (Get-Content $template -Raw) -replace '\{\{CLAUDE_DIR\}\}', $claudeDirJson
  if ($DryRun) { Log "DRY escribiría settings.json en $target" }
  elseif (Test-Path $target) {
    $cur = Get-Content $target -Raw | ConvertFrom-Json
    $add = $rendered | ConvertFrom-Json
    $cur | Add-Member -NotePropertyName hooks -NotePropertyValue $add.hooks -Force
    ($cur | ConvertTo-Json -Depth 20) | Set-Content $target
    Log "settings.json mergeado (hooks)"
  } else { $rendered | Set-Content $target; Log "settings.json escrito" }
}

Log "Listo. Reinicia Claude Code. Prueba: /cost-report, /parallel-tasks, /parallel-review"
