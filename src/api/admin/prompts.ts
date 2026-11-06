import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import type { IPrompt, TPromptScope, TPromptType } from "@/api/prompts";
import { api } from "@/lib/api-client.ts";

export interface IAdminPromptsQuery {
  scope?: TPromptScope;
  type?: TPromptType;
  search?: string;
  page?: number;
  limit?: number;
}

const promptsPath = (query: IAdminPromptsQuery) => {
  const params = new URLSearchParams();
  params.set("scope", query.scope ?? "public");
  if (query.type) {
    params.set("type", query.type);
  }
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  return `/prompts?${params.toString()}`;
};

export const useAdminPrompts = (query: IAdminPromptsQuery = {}) =>
  useQuery({
    queryKey: queryKeys.admin.prompts(query as Record<string, unknown>),
    queryFn: async () => await api.get<IPrompt[]>(promptsPath(query)),
    placeholderData: keepPreviousData,
    throwOnError: true,
  });

export const useAdminDeletePrompt = () =>
  useMutation({
    mutationFn: async (id: number) =>
      await api.delete<void>(`/prompts/admin/${id}`),
    meta: {
      invalidates: [
        queryKeys.prompts.all,
        queryKeys.admin.prompts(),
        queryKeys.admin.stats,
      ],
    },
  });
