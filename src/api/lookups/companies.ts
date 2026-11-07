import { useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client";

export interface ICompany {
  id: number;
  name: string;
  aliases?: string[] | null;
  links?: { type: string; url: string }[] | null;
  careerPageUrl?: string | null;
  researchDossier?: unknown;
  crawledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const useCompany = (id: number) =>
  useSuspenseQuery({
    queryFn: async () => await api.get<ICompany>(`/company/${id}`),
    queryKey: queryKeys.lookups.company(id),
    staleTime: 1000 * 60 * 30,
  });

export const useCompanies = () =>
  useSuspenseQuery({
    queryFn: async () => await api.get<ICompany[]>("/company?sort=name:asc"),
    queryKey: queryKeys.lookups.companies,
    staleTime: 1000 * 60 * 30,
  });
