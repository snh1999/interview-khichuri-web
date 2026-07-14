import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client.ts";

export const ALL_PROVIDERS = [
  "google",
  "openai",
  "groq",
  "openrouter",
  "mistral",
  "cerebras",
] as const;

export type TApiKeyProvider = (typeof ALL_PROVIDERS)[number];

export const PROVIDER_LABELS: Record<TApiKeyProvider, string> = {
  google: "Google",
  openai: "OpenAI",
  groq: "Groq",
  openrouter: "OpenRouter",
  mistral: "Mistral",
  cerebras: "Cerebras",
} as const;

export interface IApiKey {
  id: string;
  name: string;
  userId: string | null;
  provider: TApiKeyProvider;
  isActive: boolean | null;
  model: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateApiKeyDto {
  name: string;
  provider: TApiKeyProvider;
  key: string;
  isActive?: boolean;
  model?: string;
}

export interface IUpdateApiKeyDto {
  name?: string;
  model?: string | null;
}

export const useApiKeys = (provider?: string, isActive?: boolean) =>
  useSuspenseQuery({
    queryKey: queryKeys.keys.list({ provider, isActive }),
    queryFn: async () => {
      const parameters = new URLSearchParams();
      if (provider) {
        parameters.set("provider", provider);
      }
      if (isActive !== undefined) {
        parameters.set("isActive", String(isActive));
      }
      const qs = parameters.toString();
      return await api.get<IApiKey[]>(`/ai/api-keys${qs ? `?${qs}` : ""}`);
    },
  });

export const useCreateApiKey = () =>
  useMutation({
    mutationFn: async (dto: ICreateApiKeyDto) =>
      await api.post<IApiKey>("/ai/api-keys", dto),
    meta: { invalidates: queryKeys.keys.all },
  });

export const useDeleteApiKey = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai/api-keys/${id}`);
    },
    meta: { invalidates: queryKeys.keys.all },
  });

export const useActivateApiKey = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/ai/api-keys/${id}/activate`);
    },
    meta: { invalidates: queryKeys.keys.all },
  });

export const useUpdateApiKey = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IUpdateApiKeyDto & { id: string }) =>
      await api.patch<IApiKey>(`/ai/api-keys/${id}`, dto),
    meta: { invalidates: queryKeys.keys.all },
  });
