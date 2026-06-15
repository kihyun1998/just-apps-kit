import { defineConfig } from "tsup";

// 두 설정은 같은 dist에 병렬로 출력된다. 어느 쪽이든 clean: true를 켜면,
// 그 clean이 다른 쪽의 dts 패스(가장 늦게 끝남)보다 늦게 돌면서 방금 쓴
// 선언 파일(예: terms.d.ts)을 지워버린다. 그래서 clean은 두 설정 모두 false로
// 두고, dist 비우기는 package.json의 "clean" 스크립트가 빌드 전에 한 번만 한다.
export default defineConfig([
  // 1) 컴포넌트 번들 — React 클라이언트 컴포넌트라 "use client" 배너 필수.
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
