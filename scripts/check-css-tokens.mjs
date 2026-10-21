/**
 * Check CSS custom properties
 *
 * Fails when a `var(--name)` in src/ names a custom property that nothing
 * defines. A misspelled token is not an error in CSS: the declaration is
 * dropped and the element silently keeps what it inherits, so neither
 * Stylelint nor the browser reports it.
 *
 * Run with: node scripts/check-css-tokens.mjs (part of `make lint`)
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const srcDir = join(root, 'src');

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(css|vue|ts)$/.test(entry.name) ? [path] : [];
  });
}

const defined = new Set();
const references = [];

for (const file of sourceFiles(srcDir)) {
  const text = readFileSync(file, 'utf8');
  // A definition: `--name:` in CSS, or `'--name'` set from script
  for (const match of text.matchAll(/(--[\w-]+)\s*:|['"`](--[\w-]+)['"`]/g)) {
    defined.add(match[1] ?? match[2]);
  }
  text.split('\n').forEach((line, index) => {
    for (const match of line.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
      // A var() with a fallback is deliberate, so it is not reported
      if (!match[2]) {
        references.push({ file, line: index + 1, name: match[1] });
      }
    }
  });
}

// Reka UI sets its own `--reka-*` properties at runtime
const missing = references.filter(
  (ref) => !defined.has(ref.name) && !ref.name.startsWith('--reka-')
);

if (missing.length > 0) {
  console.error('Undefined CSS custom properties:');
  for (const ref of missing) {
    console.error(`  ${ref.name}  ${relative(root, ref.file)}:${ref.line}`);
  }
  console.error('\nDefine the token in src/styles/tokens.css or use an existing one.');
  process.exit(1);
}

console.log(`CSS tokens OK (${String(references.length)} references checked).`);
