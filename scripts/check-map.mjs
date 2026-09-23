#!/usr/bin/env node
// Checks the territory map under docs/map/: links and #anchors resolve, every
// note has its kind's full section set, every symbol named under `## Code`
// exists in the file it is attributed to, and invariant <-> territory edges
// are reciprocal.
//
// Usage: node scripts/check-map.mjs [note.md ...]   (no args = whole map)
// Scope: every *.md under docs/map/ — re-derived from the directory listing.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const MAP = join(ROOT, "docs/map");

const SECTIONS = {
  territory: [
    "What it is",
    "Governing decisions",
    "Design model",
    "Code",
    "Reference behaviour",
    "Cross-cutting invariants",
    "Blast radius",
    "Known holes / open",
  ],
  invariant: [
    "The fact",
    "Why it is cross-cutting",
    "Territories it holds in",
    "What a violation looks like",
    "Discovery history",
    "Where it will recur",
  ],
};

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : [];
  });
}

function kindOf(file) {
  const rel = relative(MAP, file);
  if (rel.startsWith("territory/")) return "territory";
  if (rel.startsWith("invariant/")) return "invariant";
  return "hub";
}

// Blank fenced blocks and inline code spans (keep offsets and newlines).
function blankCode(text) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  return text.replace(/^```[\s\S]*?^```/gm, blank).replace(/`[^`\n]*`/g, blank);
}

// GitHub heading slug.
function slug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

function headings(text) {
  return blankCode(text)
    .split(/\r?\n/)
    .filter((l) => /^#{1,6}\s/.test(l))
    .map((l) => l.replace(/^#{1,6}\s+/, "").trim());
}

// Body of a `## name` section, raw (code spans kept).
function section(text, name) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === `## ${name}`);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^##\s/.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n");
}

function linksIn(text) {
  const out = [];
  for (const m of blankCode(text).matchAll(/\]\(([^)\s]+)\)/g)) out.push(m[1]);
  return out;
}

function checkLinks(file, text, errors) {
  for (const href of linksIn(text)) {
    if (/^[a-z]+:/i.test(href)) continue;
    const [path, anchor] = href.split("#");
    const target = path ? resolve(dirname(file), path) : file;
    if (!existsSync(target)) {
      errors.push(`broken link: ${href}`);
      continue;
    }
    if (anchor && target.endsWith(".md")) {
      const slugs = headings(readFileSync(target, "utf8")).map(slug);
      if (!slugs.includes(anchor)) errors.push(`broken anchor: ${href}`);
    }
  }
}

function checkSections(file, text, errors) {
  const want = SECTIONS[kindOf(file)];
  if (!want) return;
  const have = headings(text);
  for (const s of want) if (!have.includes(s)) errors.push(`missing section: ## ${s}`);
}

// `## Code` lines: "- `path/to/file.ts` — `SymbolA`, `SymbolB`".
function checkCode(file, text, errors) {
  if (kindOf(file) !== "territory") return;
  const body = section(text, "Code");
  if (body === null || /\*\*None\.\*\*/.test(body)) return;
  let lines = 0;
  for (const line of body.split("\n")) {
    const m = line.match(/^- `([^`]+\.[a-z]+)`\s+—\s+(.*)$/);
    if (!m) continue;
    lines++;
    const src = join(ROOT, m[1]);
    if (!existsSync(src)) {
      errors.push(`code: file not found: ${m[1]}`);
      continue;
    }
    const content = readFileSync(src, "utf8");
    for (const s of m[2].matchAll(/`([^`]+)`/g)) {
      const name = s[1];
      const re = new RegExp(`(^|[^\\w$])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\w$]|$)`, "m");
      if (!re.test(content)) errors.push(`code: \`${name}\` not in ${m[1]}`);
    }
  }
  if (lines === 0) errors.push("code: no `- \\`file\\` — \\`Symbol\\`` lines and no **None.**");
}

function noteLinks(file, text, name) {
  const body = section(text, name) ?? "";
  return linksIn(body)
    .filter((h) => !/^[a-z]+:/i.test(h))
    .map((h) => resolve(dirname(file), h.split("#")[0]));
}

function checkReciprocity(file, text, errors) {
  const kind = kindOf(file);
  if (kind === "invariant") {
    for (const t of noteLinks(file, text, "Territories it holds in")) {
      if (!existsSync(t)) continue;
      const back = noteLinks(t, readFileSync(t, "utf8"), "Cross-cutting invariants");
      if (!back.includes(file)) errors.push(`reciprocity: ${relative(MAP, t)} does not list this invariant`);
    }
  } else if (kind === "territory") {
    for (const i of noteLinks(file, text, "Cross-cutting invariants")) {
      if (!existsSync(i)) continue;
      const back = noteLinks(i, readFileSync(i, "utf8"), "Territories it holds in");
      if (!back.includes(file)) errors.push(`reciprocity: ${relative(MAP, i)} does not list this territory`);
    }
  }
}

const files = process.argv.length > 2 ? process.argv.slice(2).map((f) => resolve(f)) : walk(MAP);
let failed = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const errors = [];
  checkLinks(file, text, errors);
  checkSections(file, text, errors);
  checkCode(file, text, errors);
  checkReciprocity(file, text, errors);
  if (errors.length) {
    failed++;
    console.log(`✗ ${relative(ROOT, file)}`);
    for (const e of errors) console.log(`    ${e}`);
  }
}
console.log(`${files.length - failed}/${files.length} notes clean`);
process.exit(failed ? 1 : 0);
