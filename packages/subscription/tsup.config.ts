import { defineConfig } from "tsup";

// clean: false는 의도적 — docs/map/territory/build.md
export default defineConfig([
  // 1) UI 컴포넌트 번들.
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
  // 2) core — 타입 + 상수. 배너 없음은 의도적 — docs/map/invariant/client-server-entry-split.md
  {
    entry: { core: "src/core.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: false,
  },
  // 3) store — Zustand store + hooks. external 목록은 의도적 — docs/map/invariant/peer-singletons.md
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
