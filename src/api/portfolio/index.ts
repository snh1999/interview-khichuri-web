import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type {
  CanvasElement,
  FrameElement,
  GeneratedDesign,
  ThemeConfig,
} from "@/components/portfolio/sketch/types";
import { api, streamPost } from "@/lib/api-client";

// TODO(backend): the sketch endpoint has no way to receive the existing project,
// so the BE cannot be feature-complete for two cases. Not implemented server-side;
// revisit when the backend adds support. Remove these notes once it does.
//
// 1. Route-preserving "append" — the request carries only the selected artboards,
//    so the returned file map (incl. the /App.js router) covers only the new
//    pages; applying it overwrites the existing router and drops prior routes.
//    BE needs to accept the existing files/routes and merge the new page into them.
// 2. Inspiration images — uploaded images live in browser IndexedDB (`idb://`).
//    The client now inlines them as data URLs before sending, but the BE must
//    accept/read a data URL in frame.inspirationImageUrl (and size-limit it).
export interface IGenerateSketchDto {
  prompt: string;
  frames: FrameElement[];
  elements: CanvasElement[];
  theme: ThemeConfig;
  provider: string;
  model?: string;
  instruction?: string;
}

export interface IBuilderManifestEntry {
  path: string;
  hash?: string;
  size?: number;
}

export interface IGenerateBuilderDto {
  prompt: string;
  files: Record<string, string>;
  manifest: IBuilderManifestEntry[];
  provider: string;
  model?: string;
  instruction?: string;
}

export interface IBuilderResult {
  files: Record<string, string>;
  message: string;
  applied: string[];
}

/** Genesis result: the builder result plus the planned files that failed to generate. */
export interface IGenerateProjectResult extends IBuilderResult {
  failed: string[];
}

export const useGenerateSketch = () =>
  useMutation({
    mutationFn: async (dto: IGenerateSketchDto) =>
      await api.post<GeneratedDesign>("/portfolio/sketch", dto, {
        timeoutMs: 120_000,
      }),
  });

export const useGenerateBuilder = () =>
  useMutation({
    mutationFn: async (dto: IGenerateBuilderDto) =>
      await api.post<IBuilderResult>("/portfolio/builder", dto, {
        timeoutMs: 120_000,
      }),
  });

export interface IGenerateProjectDto {
  prompt: string;
  provider: string;
  model?: string;
  instruction?: string;
}

export interface IFilePlanEntry {
  path: string;
  description: string;
}

export type TProjectStreamChunk =
  | { type: "plan"; files: IFilePlanEntry[] }
  | { type: "file-start"; path: string }
  | { type: "file-complete"; path: string; content: string }
  | {
      type: "finish";
      files: Record<string, string>;
      message: string;
      failed: string[];
    }
  | { type: "error"; message: string };

export interface IGenerateProjectProgress {
  plan: IFilePlanEntry[];
  completed: string[];
}

/**
 * Genesis flow: streams a whole project from a prompt, invoking `onFiles` with
 * each file as it is written (so the store can seed it live). Resolves with the
 * final project on the `finish` chunk, or null if aborted.
 */
export const useGenerateProject = (
  onFiles: (files: Record<string, string>) => void
) => {
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState<IGenerateProjectProgress>({
    plan: [],
    completed: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (
      dto: IGenerateProjectDto
    ): Promise<IGenerateProjectResult | null> => {
      setIsPending(true);
      setProgress({ plan: [], completed: [] });
      const controller = new AbortController();
      abortRef.current = controller;
      let result: IGenerateProjectResult | null = null;

      try {
        for await (const chunk of streamPost<TProjectStreamChunk>(
          "/portfolio/generate",
          dto,
          controller.signal
        )) {
          if (chunk.type === "plan") {
            setProgress({ plan: chunk.files, completed: [] });
          } else if (chunk.type === "file-complete") {
            onFiles({ [chunk.path]: chunk.content });
            setProgress((prev) => ({
              plan: prev.plan,
              completed: prev.completed.includes(chunk.path)
                ? prev.completed
                : [...prev.completed, chunk.path],
            }));
          } else if (chunk.type === "finish") {
            if (chunk.files) {
              result = {
                files: chunk.files,
                message: chunk.message,
                applied: [],
                failed: chunk.failed ?? [],
              };
            }
          } else if (chunk.type === "error") {
            throw new Error(chunk.message);
          }
        }
      } finally {
        setIsPending(false);
        abortRef.current = null;
      }

      return result;
    },
    [onFiles]
  );

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return {
    run,
    cancel,
    isPending,
    plan: progress.plan,
    completed: progress.completed,
  };
};
