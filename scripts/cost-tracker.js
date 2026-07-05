#!/usr/bin/env node
/**
 * cost-tracker.js — Stop hook (self-contained, zero dependencies).
 *
 * Reads the Stop-hook JSON payload from stdin ({ session_id, transcript_path,
 * ... }), sums token usage across every assistant turn in the transcript JSONL,
 * estimates cost from a rate table, and appends ONE cumulative row to
 * ~/.claude/metrics/costs.jsonl.
 *
 * The `/cost-report` command reads that file (latest row per session_id).
 * Cross-platform (macOS/Linux/Windows): pure Node, no shell tools.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

// Approximate per-1M-token billing rates (USD). Adjust if pricing changes.
const RATE_TABLE = {
  haiku:  { in: 0.80,  out: 4.0,  cacheWrite: 1.00,  cacheRead: 0.08 },
  sonnet: { in: 3.00,  out: 15.0, cacheWrite: 3.75,  cacheRead: 0.30 },
  opus:   { in: 15.00, out: 75.0, cacheWrite: 18.75, cacheRead: 1.50 },
};

function getRates(model) {
  const m = String(model || '').toLowerCase();
  if (m.includes('haiku')) return RATE_TABLE.haiku;
  if (m.includes('opus'))  return RATE_TABLE.opus;
  return RATE_TABLE.sonnet;
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function sumUsage(transcriptPath) {
  let content;
  try {
    content = fs.readFileSync(transcriptPath, 'utf8');
  } catch {
    return null;
  }
  let input = 0, output = 0, cacheWrite = 0, cacheRead = 0, model = 'unknown';
  for (const line of content.split('\n')) {
    if (!line.trim()) continue;
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.type !== 'assistant' || !e.message || !e.message.usage) continue;
    const u = e.message.usage;
    input      += num(u.input_tokens);
    output     += num(u.output_tokens);
    cacheWrite += num(u.cache_creation_input_tokens);
    cacheRead  += num(u.cache_read_input_tokens);
    if (e.message.model) model = e.message.model;
  }
  return { input, output, cacheWrite, cacheRead, model };
}

function estimateCost(u) {
  const r = getRates(u.model);
  return (
    (u.input * r.in) +
    (u.output * r.out) +
    (u.cacheWrite * r.cacheWrite) +
    (u.cacheRead * r.cacheRead)
  ) / 1e6;
}

function main() {
  let payload = {};
  try { payload = JSON.parse(readStdin() || '{}'); } catch { /* ignore */ }

  const transcriptPath = payload.transcript_path;
  if (!transcriptPath) process.exit(0); // nothing to do, never block

  const usage = sumUsage(transcriptPath);
  if (!usage) process.exit(0);

  const row = {
    timestamp: new Date().toISOString(),
    session_id: payload.session_id || '',
    transcript_path: transcriptPath,
    model: usage.model,
    input_tokens: usage.input,
    output_tokens: usage.output,
    cache_write_tokens: usage.cacheWrite,
    cache_read_tokens: usage.cacheRead,
    estimated_cost_usd: Number(estimateCost(usage).toFixed(6)),
  };

  try {
    const dir = path.join(os.homedir(), '.claude', 'metrics');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'costs.jsonl'), JSON.stringify(row) + '\n');
  } catch { /* never block the session on a logging failure */ }

  process.exit(0);
}

main();
