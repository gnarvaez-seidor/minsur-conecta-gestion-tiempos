/**
 * verify-export.mjs — CI guard for the SAP Workzone static-export contract (risk #1).
 *
 * Proves the exported bundle is SELF-CONTAINED and RELATIVE so it loads under the unknown,
 * version-bearing App Repo base path. For every script/link ref in the exported HTML files it:
 *   (a) FAILS if the ref is root-absolute (`/_next/...`, `/...`) — would 404 under the base path;
 *   (b) resolves each relative ref against the HTML file's dir and FAILS if the file is missing.
 *
 * Server-free, deterministic, fast. Run after `next build` (which already relativizes).
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

const OUT = "out";

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

try {
  statSync(OUT);
} catch {
  console.error(`[verify-export] '${OUT}/' not found — run 'next build' first.`);
  process.exit(1);
}

const REF = /\s(?:src|href)=["']([^"']+)["']/g;
const SKIP = /^(?:https?:|data:|mailto:|tel:|#|\/\/)/i;
const errors = [];
let checked = 0;

for (const file of walkHtml(OUT)) {
  const html = readFileSync(file, "utf8");
  const dir = dirname(file);
  let m;
  while ((m = REF.exec(html)) !== null) {
    const ref = m[1];
    if (!ref || SKIP.test(ref)) continue;
    if (ref.startsWith("/")) {
      errors.push(`${file}: root-absolute ref "${ref}" (must be relative for the versioned App Repo base)`);
      continue;
    }
    const target = resolve(dir, ref.split(/[?#]/)[0]);
    checked++;
    if (!existsSync(target)) errors.push(`${file}: relative ref "${ref}" -> missing file ${target}`);
  }
}

if (errors.length) {
  console.error(`[verify-export] FAILED (${errors.length} issue(s)):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

console.log(`[verify-export] OK: ${checked} asset ref(s) are relative and resolve on disk under ${OUT}/.`);
