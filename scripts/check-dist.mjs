// Checks each package's built dist against its package.json exports:
// every exported file exists, server-safe entries carry no "use client"
// banner and import no React, and every other JS entry starts with the banner.
// Usage: node scripts/check-dist.mjs   (after `pnpm build`)
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SERVER_SAFE = {
  "@just-apps/auth": ["./terms"],
  "@just-apps/subscription": ["./core"],
};

const BANNER = /^\s*["']use client["'];/;
const REACT_IMPORT = /(?:from\s*|require\()\s*["'](?:react|react-dom|lucide-react)(?:\/[^"']*)?["']/;

const root = new URL("..", import.meta.url).pathname;
const failures = [];

for (const dir of readdirSync(join(root, "packages"))) {
  const pkgDir = join(root, "packages", dir);
  const pkgPath = join(pkgDir, "package.json");
  if (!existsSync(pkgPath)) continue;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const serverSafe = SERVER_SAFE[pkg.name] ?? [];

  for (const subpath of serverSafe) {
    if (!pkg.exports?.[subpath]) failures.push(`${pkg.name}: server-safe ${subpath} is not in exports`);
  }

  for (const [subpath, conditions] of Object.entries(pkg.exports ?? {})) {
    for (const [condition, file] of Object.entries(conditions)) {
      const path = join(pkgDir, file);
      const where = `${pkg.name} ${subpath} (${condition}: ${file})`;
      if (!existsSync(path)) {
        failures.push(`${where}: missing`);
        continue;
      }
      if (condition === "types") {
        if (readFileSync(path, "utf8").includes("shared/")) failures.push(`${where}: references shared/ instead of inlining it`);
        continue;
      }
      const code = readFileSync(path, "utf8");
      if (serverSafe.includes(subpath)) {
        if (BANNER.test(code)) failures.push(`${where}: server-safe entry has the "use client" banner`);
        if (REACT_IMPORT.test(code)) failures.push(`${where}: server-safe entry imports React`);
      } else if (!BANNER.test(code)) {
        failures.push(`${where}: client entry lacks the "use client" banner`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("dist matches exports");
