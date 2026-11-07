import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client.ts";

export const FEEDBACK_TYPES = [
  "bug",
  "feedback",
  "company_request",
  "visit",
] as const;
export type TFeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_STATUSES = ["new", "triaged", "resolved"] as const;
export type TFeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_STATUS_OPTIONS = [
  { value: "unset", label: "Unset" },
  { value: "new", label: "New" },
  { value: "triaged", label: "Triaged" },
  { value: "resolved", label: "Resolved" },
] as const;

export const FEEDBACK_TYPE_LABELS: Record<TFeedbackType, string> = {
  bug: "Bug",
  feedback: "General feedback",
  // biome-ignore lint/style/useNamingConvention: feedback type is snake_case on the API
  company_request: "Company request",
  visit: "Visit",
};

export interface IAdminFeedback {
  id: string;
  type: string;
  message: string;
  route: string;
  userAgent: string | null;
  status: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminFeedbackResponse {
  items: IAdminFeedback[];
  total: number;
}

export interface IAdminFeedbackQuery {
  type?: TFeedbackType;
  status?: TFeedbackStatus | "unset";
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IRefTokenResult {
  token: string;
  suffix: string;
  url: string;
}

export interface IGenerateRefTokenInput {
  text: string;
  baseUrl?: string;
}

const feedbackPath = (query: IAdminFeedbackQuery) => {
  const params = new URLSearchParams();
  if (query.type) {
    params.set("type", query.type);
  }
  if (query.status) {
    params.set("status", query.status);
  }
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  if (query.sort) {
    params.set("sort", query.sort);
  }
  const qs = params.toString();
  return `/admin/feedback${qs ? `?${qs}` : ""}`;
};

export const useAdminFeedback = (query: IAdminFeedbackQuery = {}) =>
  useQuery({
    queryKey: queryKeys.admin.feedback(query as Record<string, unknown>),
    queryFn: async () =>
      await api.get<IAdminFeedbackResponse>(feedbackPath(query)),
    placeholderData: keepPreviousData,
    throwOnError: true,
  });

export const useAdminUpdateFeedbackStatus = () =>
  useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: TFeedbackStatus | null;
    }) => await api.patch<IAdminFeedback>(`/admin/feedback/${id}`, { status }),
    meta: {
      invalidates: [queryKeys.admin.feedback()],
    },
  });

export const useAdminDeleteFeedback = () =>
  useMutation({
    mutationFn: async (id: string) =>
      await api.delete<void>(`/admin/feedback/${id}`),
    meta: {
      invalidates: [queryKeys.admin.feedback()],
    },
  });
