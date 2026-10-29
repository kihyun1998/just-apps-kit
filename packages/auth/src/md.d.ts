// Markdown imported as a string (pairs with the tsup/esbuild .md text loader).
declare module "*.md" {
  const content: string;
  export default content;
}
