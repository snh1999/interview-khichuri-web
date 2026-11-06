import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client.ts";

export const PROMPT_TYPES = [
  "resume",
  "behavioral",
  "technical",
  "system_design",
  "general",
  "custom",
] as const;

export const PROMPT_TYPE_LABELS: Record<(typeof PROMPT_TYPES)[number], string> =
  {
    resume: "Resume",
    behavioral: "Behavioral",
    technical: "Technical",
    // biome-ignore lint/style/useNamingConvention: <>
    system_design: "System Design",
    general: "General",
    custom: "Custom",
  };

export type TPromptType = (typeof PROMPT_TYPES)[number];
export type TPromptScope = "public" | "my";

export interface IPrompt {
  id: number;
  userId: string | null;
  title: string;
  prompt: string;
  type: TPromptType;
  isPublic: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePromptDto {
  title: string;
  prompt: string;
  type: TPromptType;
  isPublic?: boolean;
}

export interface IUpdatePromptDto {
  title?: string;
  prompt?: string;
  type?: TPromptType;
  isPublic?: boolean;
}

interface IToggleLikeResult {
  likeCount: number;
}

export interface IPromptDefault {
  type: string;
  promptId: number;
  prompt: IPrompt;
}

interface ISetDefaultDto {
  type: TPromptType;
  promptId: number;
}

const buildUrl = (
  path: string,
  params?: Record<string, string | undefined>
): string => {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, value);
      }
    }
  }
  const qs = searchParams.toString();
  return `/prompts${path}${qs ? `?${qs}` : ""}`;
};

export const usePrompts = (
  scope: TPromptScope,
  type?: string,
  search?: string
) =>
  useSuspenseQuery({
    queryKey: queryKeys.prompts.list(scope, { type, search }),
    queryFn: async () =>
      await api.get<IPrompt[]>(buildUrl("", { scope, type, search })),
  });

export const useLikedPrompts = (type?: string) =>
  useSuspenseQuery({
    queryKey: queryKeys.prompts.liked({ type }),
    queryFn: async () => await api.get<IPrompt[]>(buildUrl("/likes", { type })),
  });

export const usePromptDefaults = () =>
  useSuspenseQuery({
    queryKey: queryKeys.prompts.defaults,
    queryFn: async () => await api.get<IPromptDefault[]>("/prompts/defaults"),
  });

export const useCreatePrompt = () =>
  useMutation({
    mutationFn: async (dto: ICreatePromptDto) =>
      await api.post<IPrompt>("/prompts", dto),
    meta: { invalidates: [queryKeys.prompts.all] },
  });

export const useGetPromptById = (id: number) =>
  useSuspenseQuery({
    queryKey: queryKeys.prompts.details(id),
    queryFn: async () => await api.get<IPrompt>(`/prompts/${id}`),
  });

export const useUpdatePrompt = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IUpdatePromptDto & { id: number }) =>
      await api.patch<IPrompt>(`/prompts/${id}`, dto),
    meta: { invalidates: [queryKeys.prompts.all] },
  });

export const useDeletePrompt = () =>
  useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/prompts/${id}`);
    },
    meta: { invalidates: [queryKeys.prompts.all] },
  });

export const useToggleLike = () =>
  useMutation({
    mutationFn: async (promptId: number) =>
      await api.post<IToggleLikeResult>(`/prompts/${promptId}/like`),
    meta: { invalidates: [queryKeys.prompts.all] },
  });

export const useSetPromptDefault = () =>
  useMutation({
    mutationFn: async (dto: ISetDefaultDto) =>
      await api.put("/prompts/defaults", dto),
    meta: { invalidates: [queryKeys.prompts.defaults] },
  });

export interface IShapeError {
  field: string;
  message: string;
}

export interface IShapeCheckResult {
  pass: boolean;
  errors: IShapeError[];
}

export interface ILlmJudgeResult {
  pass: boolean;
  reason: string;
  suggestion: string;
}

export interface IValidationResult {
  shape: IShapeCheckResult;
  llmJudge: ILlmJudgeResult | null;
}

export interface IValidatePromptDto {
  prompt: string;
  type: TPromptType;
  title?: string;
  provider?: string;
}

export const useValidatePrompt = () =>
  useMutation({
    mutationFn: async (dto: IValidatePromptDto) =>
      await api.post<IValidationResult>("/prompts/validate", dto),
  });
