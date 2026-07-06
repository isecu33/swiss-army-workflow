#!/usr/bin/env node
/**
 * setup-check.js - Verifica que la config del equipo esta instalada y activa
 * en ~/.claude. Cross-platform (Node puro, sin dependencias).
 *
 * Uso:  node scripts/setup-check.js            (desde el repo)
 *       node ~/.claude/scripts/setup-check.js  (tras instalar)
 * Exit 0 si todo lo obligatorio pasa; 1 si falta algo.
 */
'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var cp = require('child_process');

var CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
var results = [];
function add(level, label, hint) { results.push({ level: level, label: label, hint: hint || '' }); }

function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch (e) { return false; } }
function countMd(dir) { try { return fs.readdirSync(dir).filter(function (f) { return f.endsWith('.md'); }).length; } catch (e) { return 0; } }

if (isDir(CLAUDE_DIR)) add('ok', '~/.claude encontrado (' + CLAUDE_DIR + ')');
else add('fail', '~/.claude no existe (' + CLAUDE_DIR + ')', 'Corre install.sh / install.ps1');

['agents', 'commands', 'rules', 'scripts'].forEach(function (d) {
  var p = path.join(CLAUDE_DIR, d);
  if (isDir(p)) {
    var sym = '';
    try { sym = fs.lstatSync(p).isSymbolicLink() ? ' (symlink)' : ''; } catch (e) {}
    var extra = (d === 'agents' || d === 'commands') ? ' - ' + countMd(p) + ' .md' : '';
    add('ok', d + '/ presente' + sym + extra);
  } else {
    add('fail', d + '/ falta', 'Reinstala con install.sh / install.ps1');
  }
});

var settingsPath = path.join(CLAUDE_DIR, 'settings.json');
var settings = null;
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) {}
if (!settings) {
  add('fail', 'settings.json no encontrado o invalido', 'Reinstala para regenerarlo');
} else {
  var blob = JSON.stringify(settings.hooks || {});
  var hasCost = blob.indexOf('cost-tracker.js') !== -1;
  var hasSess = blob.indexOf('session-save.js') !== -1;
  add(hasCost ? 'ok' : 'fail', 'hook cost-tracker ' + (hasCost ? 'cableado' : 'ausente'), hasCost ? '' : 'Falta en settings.json > hooks > Stop');
  add(hasSess ? 'ok' : 'warn', 'hook session-save ' + (hasSess ? 'cableado' : 'ausente'), hasSess ? '' : 'Opcional, pero recomendado');
}

['cost-tracker.js', 'session-save.js'].forEach(function (s) {
  var p = path.join(CLAUDE_DIR, 'scripts', s);
  if (!fs.existsSync(p)) { add('fail', s + ' no existe', 'Reinstala'); return; }
  var r = cp.spawnSync(process.execPath, [p], { input: '{}', timeout: 10000 });
  add(r.status === 0 ? 'ok' : 'fail', s + ' ejecuta y sale ' + r.status, r.status === 0 ? '' : 'Revisa que Node este disponible');
});

var costs = path.join(CLAUDE_DIR, 'metrics', 'costs.jsonl');
if (fs.existsSync(costs)) {
  var n = fs.readFileSync(costs, 'utf8').split('\n').filter(Boolean).length;
  add('ok', 'metrics/costs.jsonl activo (' + n + ' filas) - hooks corriendo de verdad');
} else {
  add('warn', 'metrics/costs.jsonl aun no existe', 'Normal antes de la 1a sesion. Cierra una sesion y corre /cost-report');
}

var mark = { ok: '[ OK ]', warn: '[WARN]', fail: '[FAIL]' };
console.log('\n=== Verificacion del setup del equipo (swiss-army-workflow) ===\n');
results.forEach(function (r) {
  console.log(mark[r.level] + ' ' + r.label + (r.hint ? '\n         -> ' + r.hint : ''));
});
var fails = results.filter(function (r) { return r.level === 'fail'; }).length;
var warns = results.filter(function (r) { return r.level === 'warn'; }).length;
console.log('\nResumen: ' + (results.length - fails - warns) + ' OK - ' + warns + ' avisos - ' + fails + ' fallos');
process.exit(fails === 0 ? 0 : 1);
