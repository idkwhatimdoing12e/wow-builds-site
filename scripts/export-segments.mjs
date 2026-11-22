// After `next build` (output: "export"): Next 16 writes each page's prefetch
// files in folders, e.g. character/__next.character/__PAGE__.txt, but the
// browser asks for them with dots: character/__next.character.__PAGE__.txt.
// Vercel maps one to the other; a plain static host (Cloudflare) does not, so
// every prefetch 404s and links fall back to full page loads. This moves each
// file to the dotted name, in the folder that held the __next.* folder.
import { readdirSync, renameSync, rmSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] || "out";
let moved = 0;

function filesUnder(dir, prefix = []) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) found.push(...filesUnder(p, [...prefix, name]));
    else found.push({ path: p, parts: [...prefix, name] });
  }
  return found;
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const f of filesUnder(p)) {
        const target = join(dir, [name, ...f.parts].join("."));
        if (existsSync(target)) throw new Error(`already there: ${target}`);
        renameSync(f.path, target);
        moved++;
      }
      rmSync(p, { recursive: true });
    } else {
      walk(p);
    }
  }
}

walk(OUT);
console.log(`export-segments: moved ${moved} prefetch files to their dotted names`);
