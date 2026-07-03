/**
 * relativize-export.mjs — POST-BUILD step for the SAP Workzone HTML5 App Repository.
 *
 * WHY: Next.js static export bakes ROOT-ANCHORED `/_next/...` and `/<public>` asset URLs
 * into every HTML file at build time. The Workzone html5 runtime serves the app under an
 * unknown, version-bearing base path (`/<appHostId>~<svc>/<sapAppId>-<version>/`), so those
 * absolute URLs would 404 (blank screen — the #1 deployment break). Next has no supported
 * relative `assetPrefix` in export mode, so we rewrite the emitted HTML to relative paths.
 *
 * Because we use HASH routing, `out/` contains only depth-0 HTML (index.html, 404.html),
 * so the relative prefix is `./`. The script is depth-aware anyway, so it stays correct
 * if a real prerendered sub-route is ever added.
 *
 * NOTE: this rewrites the <script>/<link> tags in the HTML. The app must NOT use
 * dynamically-imported chunks via an absolute webpack publicPath (no `next/dynamic` with
 * absolute paths) — for a single-page hash-routed app all chunks are referenced in the HTML.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

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

let remainingAbsolute = false;
let processed = 0;

try {
  statSync(OUT);
} catch {
  console.error(`[relativize-export] '${OUT}/' not found — did 'next build' run first?`);
  process.exit(1);
}

for (const file of walkHtml(OUT)) {
  const rel = relative(OUT, file);
  const depth = rel.split(sep).length - 1; // 0 for out/index.html
  const prefix = depth === 0 ? "./" : "../".repeat(depth);

  let html = readFileSync(file, "utf8");

  // src="/..." and href="/..."  ->  relative (skip protocol-relative "//" and anchors)
  html = html.replace(/(\bsrc|\bhref)="\/(?!\/)/g, `$1="${prefix}`);
  // url(/...) inside inline <style> -> relative
  html = html.replace(/url\(\/(?!\/)/g, `url(${prefix}`);

  writeFileSync(file, html);
  processed++;

  if (/(?:src|href)="\/_next\//.test(html)) {
    remainingAbsolute = true;
    console.error(`[relativize-export] remaining absolute /_next/ ref in ${rel}`);
  }
}

console.log(`[relativize-export] processed ${processed} HTML file(s) in ${OUT}/`);

if (remainingAbsolute) {
  console.error("[relativize-export] CI GUARD FAILED: absolute /_next/ references remain.");
  process.exit(1);
}
