import { defineConfig } from "tsup";

// clean: false는 의도적 — docs/map/territory/build.md
export default defineConfig([
  // 1) 컴포넌트 번들.
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
  // 2) terms 콘텐츠 번들. 배너 없음은 의도적 — docs/map/invariant/client-server-entry-split.md
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
