#!/usr/bin/env node
/**
 * session-save.js — Stop hook (self-contained).
 *
 * Appends a lightweight breadcrumb per session stop to
 * ~/.claude/sessions/<session_id>.jsonl so work can be resumed with context.
 * Records: timestamp, cwd, git branch (best-effort), and last assistant text
 * snippet from the transcript. Never blocks the session.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const readStdin = () => { try { return fs.readFileSync(0, 'utf8'); } catch { return ''; } };

function gitBranch(cwd) {
  try {
    return cp.execSync('git rev-parse --abbrev-ref HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch { return null; }
}

function lastAssistantText(transcriptPath) {
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      let e; try { e = JSON.parse(lines[i]); } catch { continue; }
      if (e.type !== 'assistant' || !e.message || !Array.isArray(e.message.content)) continue;
      const text = e.message.content.filter((c) => c.type === 'text').map((c) => c.text).join(' ');
      if (text) return text.slice(0, 400);
    }
  } catch { /* ignore */ }
  return null;
}

function main() {
  let p = {};
  try { p = JSON.parse(readStdin() || '{}'); } catch { /* ignore */ }
  const sid = p.session_id || 'unknown';
  const cwd = p.cwd || process.cwd();

  const row = {
    timestamp: new Date().toISOString(),
    session_id: sid,
    cwd,
    branch: gitBranch(cwd),
    last: p.transcript_path ? lastAssistantText(p.transcript_path) : null,
  };

  try {
    const dir = path.join(os.homedir(), '.claude', 'sessions');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, `${sid}.jsonl`), JSON.stringify(row) + '\n');
  } catch { /* never block */ }

  process.exit(0);
}

main();
