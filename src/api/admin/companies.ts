import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client";

export const COMPANY_PROVIDERS = [
  "greenhouse",
  "lever",
  "ashby",
  "scrape",
] as const;

export type TCompanyProvider = (typeof COMPANY_PROVIDERS)[number];

export const COMPANY_PROVIDER_OPTIONS = [
  { value: "none", label: "Unconfigured" },
  ...COMPANY_PROVIDERS.map((value) => ({ value, label: value })),
] as const;

export interface IAdminCompany {
  id: number;
  name: string;
  aliases?: string[] | null;
  links?: { type: string; url: string }[] | null;
  careerPageUrl?: string | null;
  researchDossier?: unknown;
  provider?: TCompanyProvider | null;
  enabled?: boolean;
  atsBoardId?: string | null;
  feed?: unknown;
  hash?: string | null;
  crawledAt?: string | null;
  crawlError?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAdminCompanyQuery {
  name?: string;
  page?: number;
  limit?: number;
}

export interface ICompanyInput {
  name: string;
  aliases?: string[];
  links?: { type: string; url: string }[];
  careerPageUrl?: string | null;
  researchDossier?: unknown;
  provider?: TCompanyProvider | null;
  enabled?: boolean;
  atsBoardId?: string | null;
}

export interface IUpdateCompanyInput extends Partial<ICompanyInput> {
  id: number;
}

export interface IAdminJob {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  url: string | null;
  state: string;
  provider?: string | null;
  missedCrawls?: number;
  stateChangedAt?: string | null;
  crawlError?: string | null;
  createdAt?: string;
}

export interface IAdminJobsQuery {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  state?: string;
  provider?: string;
  companyId?: number;
}

export interface IAdminJobsResponse {
  items: IAdminJob[];
  total: number;
}

export interface IAiStatus {
  enabled: boolean;
  pausedUntil: string | null;
}

const companyPath = (query: IAdminCompanyQuery = {}) => {
  const params = new URLSearchParams();
  if (query.name) {
    params.set("name", query.name);
  }
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  const search = params.toString();
  return search ? `/company?${search}` : "/company";
};

export const useAdminCompanies = (query: IAdminCompanyQuery = {}) =>
  useQuery({
    queryKey: queryKeys.admin.companies(query as Record<string, unknown>),
    queryFn: async () => await api.get<IAdminCompany[]>(companyPath(query)),
    placeholderData: keepPreviousData,
    throwOnError: true,
  });

export const useCreateCompany = () =>
  useMutation({
    mutationFn: async (data: ICompanyInput) =>
      await api.post<IAdminCompany>("/company", data),
    meta: {
      invalidates: [queryKeys.admin.companies(), queryKeys.lookups.companies],
    },
  });

export const useUpdateCompany = () =>
  useMutation({
    mutationFn: async ({ id, ...data }: IUpdateCompanyInput) =>
      await api.patch<IAdminCompany>(`/company/${id}`, data),
    meta: {
      invalidates: ({ id }: IUpdateCompanyInput) => [
        queryKeys.admin.companies(),
        queryKeys.lookups.companies,
        queryKeys.lookups.company(id),
      ],
    },
  });

export const useDeleteCompany = () =>
  useMutation({
    mutationFn: async (id: number) => await api.delete<void>(`/company/${id}`),
    meta: {
      invalidates: (id: number) => [
        queryKeys.admin.companies(),
        queryKeys.lookups.companies,
        queryKeys.lookups.company(id),
      ],
    },
  });

export const useCrawlCompany = () =>
  useMutation({
    mutationFn: async (id: number) =>
      await api.post<void>(`/company/${id}/crawl?force=1`),
    meta: {
      invalidates: [
        queryKeys.admin.companies(),
        queryKeys.admin.failedJobs,
        queryKeys.admin.jobs(),
        queryKeys.jobs.all,
      ],
    },
  });

export const useAdminJobs = (query: IAdminJobsQuery = {}) =>
  useQuery({
    queryKey: queryKeys.admin.jobs(query as Record<string, unknown>),
    queryFn: async () => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      }
      const search = params.toString();
      return await api.get<IAdminJobsResponse>(
        search ? `/jobs/admin?${search}` : "/jobs/admin"
      );
    },
    placeholderData: keepPreviousData,
    throwOnError: true,
  });

export const useFailedJobs = () =>
  useQuery({
    queryKey: queryKeys.admin.failedJobs,
    queryFn: async () => await api.get<IAdminJob[]>("/jobs/admin/failed"),
    throwOnError: true,
  });

export const useRetryFailedJob = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await api.post<IAdminJob>(`/jobs/admin/${id}/retry`),
    meta: {
      invalidates: [
        queryKeys.admin.failedJobs,
        queryKeys.admin.jobs(),
        queryKeys.jobs.all,
      ],
    },
  });

export const useRetryFailedJobs = () =>
  useMutation({
    mutationFn: async () =>
      await api.post<{ count: number }>("/jobs/admin/retry-failed"),
    meta: {
      invalidates: [
        queryKeys.admin.failedJobs,
        queryKeys.admin.jobs(),
        queryKeys.jobs.all,
      ],
    },
  });

export const useSetJobDescription = () =>
  useMutation({
    mutationFn: async ({
      id,
      description,
    }: {
      id: string;
      description: string;
    }) =>
      await api.post<IAdminJob>(`/jobs/admin/${id}/description`, {
        description,
      }),
    meta: {
      invalidates: [
        queryKeys.admin.failedJobs,
        queryKeys.admin.jobs(),
        queryKeys.jobs.all,
      ],
    },
  });

export const useAdminAiStatus = () =>
  useQuery({
    queryKey: queryKeys.admin.aiStatus,
    queryFn: async () => await api.get<IAiStatus>("/jobs/admin/ai-status"),
    throwOnError: true,
  });
