import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client.ts";

export interface IAdminStats {
  users: {
    total: number;
    verified: number;
    banned: number;
    new7d: number;
    new30d: number;
    activeSessions: number;
  };
  usage: {
    jobs: number;
    prepSessions: number;
    interviews: number;
    resumes: number;
    notes: number;
    prompts: number;
    apiKeys: number;
    companies: number;
    calendarEvents: number;
  };
  signups: { date: string; count: number }[];
}

export interface IAdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminUsersResponse {
  users: IAdminUser[];
  total: number;
}

export interface IAdminUserProfile {
  firstName: string;
  lastName: string | null;
  location: string | null;
  country: string | null;
}

export interface IAdminUserCounts {
  jobs: number;
  prepSessions: number;
  interviews: number;
  resumes: number;
  notes: number;
  prompts: number;
  apiKeys: number;
  calendarEvents: number;
}

export interface IAdminUserDetail {
  user: IAdminUser;
  profile: IAdminUserProfile | null;
  counts: IAdminUserCounts;
  providers: string[];
  passkeys: number;
}

export interface IAdminUsersQuery {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  role?: string;
  banned?: boolean;
  verified?: boolean;
}

const toOptionalBoolean = (value: string | null) => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
};

export const parseAdminUsersQuery = (
  params: URLSearchParams
): IAdminUsersQuery => ({
  banned: toOptionalBoolean(params.get("banned")),
  limit: Math.max(1, Number(params.get("limit")) || 20),
  page: Math.max(1, Number(params.get("page")) || 1),
  q: params.get("q") || undefined,
  role: params.get("role") || undefined,
  sort: params.get("sort") || "createdAt:desc",
  verified: toOptionalBoolean(params.get("verified")),
});

export const useAdminUsersQueryParams = () =>
  parseAdminUsersQuery(useSearchParams()[0]);

export interface IHealth {
  status: string;
  message: string;
  timestamp: string;
  checks: unknown;
}

export const useAdminStats = () =>
  useSuspenseQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => await api.get<IAdminStats>("/admin/stats"),
  });

const usersPath = (query: IAdminUsersQuery) => {
  const params = new URLSearchParams();
  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.sort !== undefined) {
    params.set("sort", query.sort);
  }
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.role) {
    params.set("role", query.role);
  }
  if (query.banned !== undefined) {
    params.set("banned", String(query.banned));
  }
  if (query.verified !== undefined) {
    params.set("verified", String(query.verified));
  }
  const qs = params.toString();
  return `/admin/users${qs ? `?${qs}` : ""}`;
};

export const useAdminUsers = (query: IAdminUsersQuery = {}) =>
  useSuspenseQuery({
    queryKey: queryKeys.admin.users(query as Record<string, unknown>),
    queryFn: async () => await api.get<IAdminUsersResponse>(usersPath(query)),
  });

export const useAdminUsersQuery = (query: IAdminUsersQuery = {}) =>
  useQuery({
    queryKey: queryKeys.admin.users(query as Record<string, unknown>),
    queryFn: async () => await api.get<IAdminUsersResponse>(usersPath(query)),
    placeholderData: keepPreviousData,
    throwOnError: true,
  });

export const useAdminUser = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.admin.user(id ?? ""),
    queryFn: async () => await api.get<IAdminUserDetail>(`/admin/users/${id}`),
    enabled: Boolean(id),
  });

export const useAdminHealth = () =>
  useQuery({
    queryKey: queryKeys.admin.health,
    queryFn: async () => await api.get<IHealth>("/health"),
    refetchInterval: 60_000,
    retry: false,
  });
