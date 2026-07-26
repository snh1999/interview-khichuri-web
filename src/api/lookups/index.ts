import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client";

type TLookupSchema = "roles" | "topics" | "industries";

export interface ILookupEntry {
  id: number;
  name: string;
  isApproved: boolean | null;
}

const fetchLookups = async (schema: string) =>
  await api.get<ILookupEntry[]>(`/lookups/${schema}`);

export const useRoles = () =>
  useSuspenseQuery({
    queryKey: queryKeys.lookups.roles,
    queryFn: async () => await fetchLookups("roles"),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

export const useTopics = () =>
  useSuspenseQuery({
    queryKey: queryKeys.lookups.topics,
    queryFn: async () => await fetchLookups("topics"),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

export const useIndustries = () =>
  useSuspenseQuery({
    queryKey: queryKeys.lookups.industries,
    queryFn: async () => await fetchLookups("industries"),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

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
    meta: { invalidates: queryKeys.lookups[schema] },
  });
