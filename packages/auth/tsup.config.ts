import { defineConfig } from "tsup";

export default defineConfig([
  // 1) 컴포넌트 번들 — React 클라이언트 컴포넌트라 "use client" 배너 필수.
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom", "lucide-react", "boring-avatars"],
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
    banner: {
      js: '"use client";',
    },
  },
  // 2) terms 콘텐츠 번들 — 순수 데이터. 배너 없음 → 서버 라우트에서도 import 가능.
  //    md를 문자열로 인라인. `@just-apps/auth/terms` 서브경로로 노출.
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
