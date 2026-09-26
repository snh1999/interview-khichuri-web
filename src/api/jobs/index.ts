import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client";

export const JOB_STATUS = ["applied", "saved", "scheduled"] as const;

export type TJobStatus = (typeof JOB_STATUS)[number];

export type TJobSortKey =
  | "default"
  | "newest"
  | "oldest"
  | "deadline"
  | "interview";

const JOB_SORT_QUERY: Record<TJobSortKey, string | undefined> = {
  default: undefined,
  newest: "createdAt:desc",
  oldest: "createdAt:asc",
  deadline: "deadline:asc",
  interview: "interviewDate:asc",
};

interface ICommonFields {
  title: string;
  roleId?: number | null;
  topicIds?: number[];
  notes?: string | null;
  location?: string | null;
  source?: string | null;
}

export interface IJobExtractionResult {
  title?: string;
  companyName?: string | null;
  roleId?: number | null;
  topicIds?: number[];
  location?: string | null;
  source?: string | null;
  deadline: string | null;
  interviewDate: string | null;
  status: TJobStatus;
}

export interface ICreateJobDto extends ICommonFields {
  companyId?: number | null;
  companyName: string;
  description: string;
  status: TJobStatus;
  links?: string | null;
  isFavorite?: boolean;
  deadline?: Date;
  interviewDate?: Date;
  appliedAt?: Date;
}

export interface IUpdateJobDto extends Partial<ICreateJobDto> {}

export interface IJob
  extends Omit<ICreateJobDto, "deadline" | "interviewDate" | "appliedAt"> {
  id: string;
  userId?: string | null;
  companyId?: number | null;
  deadline?: string | null;
  interviewDate?: string | null;
  appliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  topicIds?: number[];
}

export interface IJobWithTopics extends IJob {
  topicIds: number[];
}

export interface IDateFilter {
  type: "deadline" | "interview" | "applied";
  from?: string;
  to?: string;
}

export const useGetJob = (id: string) =>
  useSuspenseQuery({
    queryFn: async () => await api.get<IJobWithTopics>(`/jobs/${id}`),
    queryKey: queryKeys.jobs.detail(id),
  });

export const useGetJobs = (sort: TJobSortKey = "default") =>
  useSuspenseQuery({
    queryFn: async () => {
      const sortQuery = JOB_SORT_QUERY[sort];
      return await api.get<IJob[]>(
        sortQuery ? `/jobs?sort=${sortQuery}` : "/jobs"
      );
    },
    queryKey: queryKeys.jobs.list({ sort }),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

export const useCreateJob = () =>
  useMutation({
    mutationFn: async (dto: ICreateJobDto) =>
      await api.post<IJob>("/jobs", dto),
    meta: { invalidates: queryKeys.jobs.all },
  });

export const useUpdateJob = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IUpdateJobDto & { id: string }) =>
      await api.patch<IJobWithTopics>(`/jobs/${id}`, dto),
    meta: { invalidates: queryKeys.jobs.all },
  });

export const useDeleteJob = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/jobs/${id}`);
    },
    meta: { invalidates: queryKeys.jobs.all },
  });

interface IExtractJobDto {
  description: string;
  links?: string;
  provider: string;
  model?: string;
}

export const useExtractJob = () =>
  useMutation({
    mutationFn: async (data: IExtractJobDto) =>
      await api.post<IJobExtractionResult>("/jobs/extract", data, {
        timeoutMs: 120_000,
      }),
  });
