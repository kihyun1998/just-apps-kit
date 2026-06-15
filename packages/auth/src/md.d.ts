// 마크다운을 문자열로 import (tsup/esbuild의 .md text 로더와 짝).
declare module "*.md" {
  const content: string;
  export default content;
}
