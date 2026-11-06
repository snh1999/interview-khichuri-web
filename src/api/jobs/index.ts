import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient, queryKeys } from "@/api";
import { api } from "@/lib/api-client";

export const JOB_STATUS = [
  "applied",
  "saved",
  "scheduled",
  "interviewed",
  "offer",
  "rejected",
  "not_selected",
  "withdrawn",
] as const;

export type TJobStatus = (typeof JOB_STATUS)[number];

export const JOB_WORK_TYPES = ["remote", "hybrid", "onsite"] as const;

export type TJobWorkType = (typeof JOB_WORK_TYPES)[number];

export const JOB_STATES = ["none", "ok", "failed"] as const;

export type TJobState = (typeof JOB_STATES)[number];

export type TJobSortKey =
  | "default"
  | "newest"
  | "oldest"
  | "deadline"
  | "interview"
  | "applied";

const JOB_SORT_QUERY: Record<TJobSortKey, string | undefined> = {
  default: undefined,
  newest: "createdAt:desc",
  oldest: "createdAt:asc",
  deadline: "deadline:asc",
  interview: "interviewDate:asc",
  applied: "appliedAt:desc",
};

interface ICommonFields {
  title: string;
  companyName: string;
  companyId?: number | null;
  description: string;
  roleId?: number | null;
  topicIds?: number[];
  links?: string | null;
  deadline?: Date | null;
  location?: string | null;
  url?: string | null;
  workType?: TJobWorkType | null;
  salaryLower?: number | null;
  salaryUpper?: number | null;
  currency?: string | null;
  experienceRequired?: number | null;
}

export interface IJobExtractionResult
  extends Partial<
    Omit<ICommonFields, "title" | "description" | "companyName" | "deadline">
  > {
  title?: string;
  companyName?: string | null;
  topicNames?: string[];
  deadline: string | null;
}

export interface ITrackedJob {
  id: string;
  jobId: string;
  userId?: string | null;
  status: TJobStatus;
  isFavorite: boolean;
  notes?: string | null;
  appliedAt?: string | null;
  interviewDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateTrackedJobDto {
  status?: TJobStatus;
  isFavorite?: boolean;
  notes?: string | null;
  appliedAt?: Date | null;
  interviewDate?: Date | null;
}

export interface ICreateJobDto extends ICommonFields, IUpdateTrackedJobDto {
  status: TJobStatus;
}

export interface IUpdateJobDto extends Partial<ICommonFields> {}

export interface IJob extends Omit<ICommonFields, "description" | "deadline"> {
  id: string;
  userId?: string | null;
  description: string | null;
  deadline?: string | null;
  state?: TJobState | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  track?: ITrackedJob | null;
}

export interface IJobWithTrack extends IJob {
  track: ITrackedJob;
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

export const useJobQuery = (id?: string | null) =>
  useQuery({
    enabled: Boolean(id),
    queryFn: async () => await api.get<IJobWithTopics>(`/jobs/${id}`),
    queryKey: queryKeys.jobs.detail(id ?? ""),
  });

export const useGetJobs = (sort: TJobSortKey = "default") =>
  useSuspenseQuery({
    queryFn: async () => {
      const sortQuery = JOB_SORT_QUERY[sort];
      return await api.get<IJobWithTrack[]>(
        sortQuery ? `/jobs?sort=${sortQuery}` : "/jobs"
      );
    },
    queryKey: queryKeys.jobs.listWithFilter({ sort }),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

export const useTrackedJobIds = () => {
  const { data: jobs } = useGetJobs();
  return useMemo(() => new Set(jobs.map((job) => job.id)), [jobs]);
};

interface IDiscoverJobsParams {
  search?: string;
  sort?: TJobSortKey;
  page?: number;
  limit?: number;
}

export const useDiscoverJobs = (params: IDiscoverJobsParams = {}) =>
  useSuspenseQuery({
    queryFn: async () => {
      const { search, sort = "default", page, limit } = params;
      const query = new URLSearchParams(
        Object.entries({
          search: search?.trim(),
          sort: JOB_SORT_QUERY[sort],
          page: page?.toString(),
          limit: limit?.toString(),
        }).filter(([, v]) => v) as [string, string][]
      ).toString();

      return await api.get<IJob[]>(`/jobs/discover${query && `?${query}`}`);
    },
    queryKey: queryKeys.jobs.discover(params as Record<string, unknown>),
  });

export const useCompanyJobs = (
  companyId: number,
  sort: TJobSortKey = "default"
) => {
  const sortQuery = JOB_SORT_QUERY[sort];
  return useSuspenseQuery({
    queryFn: async () =>
      await api.get<IJob[]>(
        `/company/${companyId}/jobs${sortQuery ? `?sort=${sortQuery}` : ""}`
      ),
    queryKey: queryKeys.jobs.companyJobs(companyId, { sort }),
  });
};

export const useCreateJob = () =>
  useMutation({
    mutationFn: async (dto: ICreateJobDto) =>
      await api.post<IJob>("/jobs", dto),
    meta: { invalidates: queryKeys.jobs.list },
  });

export const useUpdateJob = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IUpdateJobDto & { id: string }) =>
      await api.patch<IJobWithTopics>(`/jobs/${id}`, dto),
    meta: {
      invalidates: ({ id }: { id: string }) =>
        queryKeys.jobs.detailsAndList(id),
    },
  });

export const useUpdateTrackedJob = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IUpdateTrackedJobDto & { id: string }) =>
      await api.patch<IJob>(`/jobs/${id}/track`, dto),
    meta: {
      invalidates: ({ id }: { id: string }) =>
        queryKeys.jobs.detailsAndList(id),
    },
  });

export const useFavoriteToggle = (id: string, isFavorite: boolean) => {
  const updateTrackedJob = useUpdateTrackedJob();
  return async () => {
    await updateTrackedJob.mutateAsync({ id, isFavorite });
  };
};

export const useTrackJob = () => {
  return useMutation({
    mutationFn: async (id: string) => await api.post<IJob>(`/jobs/${id}/track`),
    onSuccess: (trackedJob) => {
      // Patch cached lists instead of invalidating: updates every discover/company card immediately.
      apiClient.setQueriesData<IJob[]>(
        {
          predicate: ({ queryKey }) =>
            queryKey[0] === "jobs" &&
            (queryKey[1] === "discover" || queryKey[1] === "company"),
        },
        (jobs) =>
          jobs?.map((job) => (job.id === trackedJob.id ? trackedJob : job))
      );
    },
    meta: {
      invalidates: (id: string) => queryKeys.jobs.detailsAndList(id),
    },
  });
};

export const useMatchJobByUrl = () =>
  useMutation({
    mutationFn: async (url: string) =>
      await api.get<IJob[]>(`/jobs/from-url?url=${encodeURIComponent(url)}`),
  });

// TODO: force-deleting a job unlinks its prep sessions, but only job queries
// are invalidated here, so session list/detail caches can keep a stale jobId.
// Invalidate queryKeys.sessions.all if we decide to fix this.
export const useDeleteJob = () =>
  useMutation({
    mutationFn: async ({ id, force }: { id: string; force?: boolean }) => {
      await api.delete(`/jobs/${id}${force ? "?force=1" : ""}`);
    },
    meta: {
      invalidates: queryKeys.jobs.list,
      removes: ({ id }: { id: string }) => [queryKeys.jobs.detail(id)],
    },
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
    meta: { invalidates: queryKeys.lookups.roles },
  });

interface IGenerateLetterDto {
  provider: string;
  model?: string;
  instruction?: string;
  resumeId?: string;
}

export interface IGeneratedLetter {
  markdown: string;
}

export const useGenerateCoverLetter = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IGenerateLetterDto & { id: string }) =>
      await api.post<IGeneratedLetter>(`/jobs/${id}/cover-letter`, dto, {
        timeoutMs: 120_000,
      }),
  });

export const useGenerateOutreachEmail = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IGenerateLetterDto & { id: string }) =>
      await api.post<IGeneratedLetter>(`/jobs/${id}/outreach`, dto, {
        timeoutMs: 120_000,
      }),
  });

export const useGenerateLinkedInDm = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IGenerateLetterDto & { id: string }) =>
      await api.post<IGeneratedLetter>(`/jobs/${id}/linkedin-dm`, dto, {
        timeoutMs: 120_000,
      }),
  });
