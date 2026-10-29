import { defineConfig } from "tsup";

// clean: false is deliberate — docs/map/territory/build.md
export default defineConfig([
  // 1) UI component bundle.
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ["react", "react-dom", "lucide-react"],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
    banner: {
      js: '"use client";',
    },
  },
  // 2) core — types + constants. No banner, deliberately — docs/map/invariant/client-server-entry-split.md
  {
    entry: { core: "src/core.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: false,
  },
  // 3) store — Zustand store + hooks. The external list is deliberate — docs/map/invariant/peer-singletons.md
  {
    entry: { store: "src/store.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ["react", "zustand", "@supabase/supabase-js"],
    banner: {
      js: '"use client";',
    },
  },
]);
