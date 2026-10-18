// The builder request no longer ships the whole project: the client sends a
// compact manifest of every file plus the full contents of only the files the
// turn is likely to touch. Small projects are still sent whole, so nothing
// changes for them.
import type { IBuilderManifestEntry } from "@/api/portfolio";

export interface IBuilderContext {
  manifest: IBuilderManifestEntry[];
  files: Record<string, string>;
}

// Below this total size, send everything (no reason to trim a small project).
export const BUILD_ALL_THRESHOLD = 60_000;

const FILE_EXTENSION = /\.[^.]+$/;
const HASH_MODULUS = 4_294_967_296;

const hashContent = (content: string): string => {
  let hash = 5381;
  for (let i = 0; i < content.length; i += 1) {
    hash = (hash * 33 + content.charCodeAt(i)) % HASH_MODULUS;
  }
  return hash.toString(16).padStart(8, "0");
};

const baseName = (path: string): string =>
  (path.split("/").pop() ?? path).replace(FILE_EXTENSION, "");

export const selectBuilderContext = (
  files: Record<string, string>,
  options: { prompt: string; activeFile?: string; openFiles?: string[] }
): IBuilderContext => {
  const manifest = Object.entries(files).map(([path, content]) => ({
    path,
    hash: hashContent(content),
    size: content.length,
  }));

  const totalSize = manifest.reduce((sum, entry) => sum + entry.size, 0);
  if (totalSize <= BUILD_ALL_THRESHOLD) {
    return { manifest, files };
  }

  const promptLower = options.prompt.toLowerCase();
  const alwaysIncluded = new Set(
    ["/App.js", options.activeFile, ...(options.openFiles ?? [])].filter(
      (path): path is string => Boolean(path)
    )
  );

  const selected: Record<string, string> = {};
  for (const [path, content] of Object.entries(files)) {
    const name = baseName(path).toLowerCase();
    const mentioned =
      promptLower.includes(path.toLowerCase()) ||
      (name.length >= 3 && promptLower.includes(name));
    if (alwaysIncluded.has(path) || mentioned) {
      selected[path] = content;
    }
  }

  return { manifest, files: selected };
};
