import { defineConfig } from "tsup";

// clean: false is deliberate — docs/map/territory/build.md
export default defineConfig([
  // 1) Component bundle.
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ["react", "react-dom", "lucide-react", "boring-avatars"],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
    banner: {
      js: '"use client";',
    },
  },
  // 2) Terms content bundle. No banner, deliberately — docs/map/invariant/client-server-entry-split.md
  {
    entry: { terms: "src/content/terms/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: false,
    esbuildOptions(options) {
      options.loader = { ...options.loader, ".md": "text" };
    },
  },
]);
