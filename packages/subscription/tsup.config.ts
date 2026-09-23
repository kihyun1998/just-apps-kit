import { defineConfig } from "tsup";

// 세 설정은 같은 dist에 병렬로 출력된다. clean: true를 켜면 늦게 끝난 쪽의
// clean이 다른 쪽이 방금 쓴 선언 파일을 지울 수 있어서(auth의 terms.d.ts 레이스와
// 같은 문제) 전부 false로 두고, dist 비우기는 package.json "clean" 스크립트가 한다.
export default defineConfig([
  // 1) UI 컴포넌트 번들 — "use client" 배너 필수.
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
  // 2) core — 타입 + 상수. 배너 없음 → 서버 라우트에서 실제 값으로 import 가능.
  {
    entry: { core: "src/core.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: false,
  },
  // 3) store — Zustand store + hooks. zustand는 peer(external)라 앱에 인스턴스가 하나만 생긴다.
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
