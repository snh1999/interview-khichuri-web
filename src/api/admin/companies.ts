import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import type { ICompany } from "@/api/resumes";
import { api } from "@/lib/api-client.ts";

export interface IAdminCompaniesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  name?: string;
}

export interface ICompanyInput {
  name: string;
  aliases?: string[];
  careerPageUrl?: string | null;
}

const companiesPath = (query: IAdminCompaniesQuery) => {
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  if (query.sort) {
    params.set("sort", query.sort);
  }
  if (query.name) {
    params.set("name", query.name);
  }
  const qs = params.toString();
  return `/company${qs ? `?${qs}` : ""}`;
};

export const useAdminCompanies = (query: IAdminCompaniesQuery = {}) =>
  useQuery({
    queryKey: queryKeys.admin.companies(query as Record<string, unknown>),
    queryFn: async () => await api.get<ICompany[]>(companiesPath(query)),
    placeholderData: keepPreviousData,
    throwOnError: true,
  });

const invalidation = [
  queryKeys.lookups.companies,
  queryKeys.admin.companies(),
  queryKeys.admin.stats,
];

export const useAdminCreateCompany = () =>
  useMutation({
    mutationFn: async (dto: ICompanyInput) =>
      await api.post<ICompany>("/company", dto),
    meta: { invalidates: invalidation },
  });

export const useAdminUpdateCompany = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: ICompanyInput & { id: number }) =>
      await api.patch<ICompany>(`/company/${id}`, dto),
    meta: { invalidates: invalidation },
  });

export const useAdminDeleteCompany = () =>
  useMutation({
    mutationFn: async (id: number) => await api.delete<void>(`/company/${id}`),
    meta: { invalidates: invalidation },
  });
