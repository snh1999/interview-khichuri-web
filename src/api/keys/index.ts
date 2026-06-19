import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client.ts";

export type TApiKeyPlatform = "google" | "openai";

export interface IApiKey {
  id: string;
  name: string;
  userId: string | null;
  platform: TApiKeyPlatform;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateApiKeyDto {
  name: string;
  platform: TApiKeyPlatform;
  key: string;
  isActive?: boolean;
}

export const useApiKeys = (platform?: string, isActive?: boolean) =>
  useSuspenseQuery({
    queryKey: queryKeys.keys.list({ platform, isActive }),
    queryFn: async () => {
      const parameters = new URLSearchParams();
      if (platform) {
        parameters.set("platform", platform);
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
