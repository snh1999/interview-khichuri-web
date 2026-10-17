// Tailwind is loaded by the sandbox through its CDN external resource, so a
// generated `@import "tailwindcss"` (or a legacy `@tailwind base` directive)
// has nothing to resolve and makes Sandpack's postcss compiler crash the
// preview (`path.isAbsolute(null)`). The API strips these on generation; this
// cleans portfolio files saved before that, at the sandbox boundary.
const CSS_EXTENSION = /\.css$/;
const TAILWIND_CSS_DIRECTIVE =
  /^[ \t]*@(?:import\s+["']tailwindcss(?:\/[^"']*)?["']|tailwind\s+(?:base|components|utilities))\s*;?[ \t]*$/gm;

export const stripTailwindDirectives = (css: string): string =>
  css.search(TAILWIND_CSS_DIRECTIVE) === -1
    ? css
    : css
        .replace(TAILWIND_CSS_DIRECTIVE, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

export const sanitizeSandpackFiles = (
  files: Record<string, string>
): Record<string, string> => {
  let changed = false;
  const next: Record<string, string> = {};
  for (const [path, code] of Object.entries(files)) {
    const cleaned = CSS_EXTENSION.test(path)
      ? stripTailwindDirectives(code)
      : code;
    changed ||= cleaned !== code;
    next[path] = cleaned;
  }
  return changed ? next : files;
};
