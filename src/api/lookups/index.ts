import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client";

export type TLookupSchema = "categories" | "roles" | "topics" | "industries";

export interface ILookupEntry {
  id: number;
  name: string;
  isApproved: boolean | null;
  categoryId?: number | null;
}

const fetchLookups = async (schema: TLookupSchema) =>
  await api.get<ILookupEntry[]>(`/lookups/${schema}`);

export const useLookups = (schema: TLookupSchema) =>
  useSuspenseQuery({
    gcTime: 1000 * 60 * 60,
    queryFn: async () => await fetchLookups(schema),
    queryKey: queryKeys.lookups[schema],
    staleTime: 1000 * 60 * 30,
  });

export const useCategories = () => useLookups("categories");

export const useRoles = () => useLookups("roles");

export const useTopics = () => useLookups("topics");

export const useIndustries = () => useLookups("industries");

export const batchCreateLookups = async (
  schema: TLookupSchema,
  names: string[]
) => await api.post<number[]>(`/lookups/${schema}/batch`, { names });

export const useCreateLookup = (schema: TLookupSchema) =>
  useMutation({
    mutationFn: async (data: { name: string }) =>
      await api.post<ILookupEntry>(`/lookups/${schema}`, data),
    meta: { invalidates: queryKeys.lookups[schema] },
  });

export const useUpdateLookup = (schema: TLookupSchema) =>
  useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      isApproved?: boolean;
    }) => await api.patch(`/lookups/${schema}/${id}`, data),
    meta: { invalidates: queryKeys.lookups[schema] },
  });

export const useDeleteLookup = (schema: TLookupSchema) =>
  useMutation({
    mutationFn: async (id: number) =>
      await api.delete(`/lookups/${schema}/${id}`),
  });
