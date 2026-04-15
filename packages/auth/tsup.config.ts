import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "lucide-react", "boring-avatars"],
  // "use client" directive는 tsup이 기본적으로 떨어뜨릴 수 있으므로
  // banner로 강제 삽입한다. Next.js App Router에서 필수.
  banner: {
    js: '"use client";',
  },
});
