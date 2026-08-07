import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client";

export const JOB_STATUS = ["applied", "saved", "scheduled"] as const;

export type TJobStatus = (typeof JOB_STATUS)[number];

interface ICommonFields {
  title: string;
  roleId?: number | null;
  topicIds?: number[];
  notes?: string | null;
  location?: string | null;
  source?: string | null;
}

export interface IJobExtractionResult extends ICommonFields {
  companyName?: string | null;
  deadline: string | null;
  interviewDate: string | null;
  status: TJobStatus | null;
}

export interface ICreateJobDto extends ICommonFields {
  companyName: string;
  description: string;
  status: TJobStatus;
  links?: string | null;
  deadline?: Date;
  interviewDate?: Date;
}

export interface IUpdateJobDto extends Partial<ICreateJobDto> {}

export interface IJob
  extends Omit<ICreateJobDto, "deadline" | "interviewDate"> {
  id: string;
  userId?: string | null;
  deadline?: string | null;
  interviewDate?: string | null;
  createdAt: string;
  updatedAt: string;
  topicIds?: number[];
}

export interface IJobWithTopics extends IJob {
  topicIds: number[];
}

export const useJobs = (search?: string) =>
  useSuspenseQuery({
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) {
        params.set("search", search);
      }
      const qs = params.toString();
      return await api.get<IJob[]>(`/jobs${qs ? `?${qs}` : ""}`);
    },
    queryKey: queryKeys.jobs.list({ search }),
  });

export const useJob = (id: string) =>
  useSuspenseQuery({
    queryFn: async () => await api.get<IJobWithTopics>(`/jobs/${id}`),
    queryKey: queryKeys.jobs.detail(id),
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
