import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
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

export interface IAdminUsersQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

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

export const useAdminUsers = (query: IAdminUsersQuery = {}) =>
  useSuspenseQuery({
    queryKey: queryKeys.admin.users(query as Record<string, unknown>),
    queryFn: async () => {
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
      const qs = params.toString();
      return await api.get<IAdminUsersResponse>(
        `/admin/users${qs ? `?${qs}` : ""}`
      );
    },
  });

export const useAdminHealth = () =>
  useQuery({
    queryKey: queryKeys.admin.health,
    queryFn: async () => await api.get<IHealth>("/health"),
    refetchInterval: 60_000,
    retry: false,
  });
