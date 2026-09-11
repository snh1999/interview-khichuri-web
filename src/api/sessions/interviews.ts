import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { apiClient, queryKeys } from "@/api";
import { api } from "@/lib/api-client.ts";
import {
  archiveLocalInterviewState,
  clearInterviewArchive,
  clearLocalInterviewState,
  getInterviewArchive,
  getLocalInterviewState,
  type ILocalInterviewState,
  setLocalInterviewState,
} from "@/lib/interviewStorage";

const BACKEND_ROOT = "interviews";
export const FOCUS_TYPE_OPTIONS = [
  { value: "prepsession", label: "Prepsession Questions" },
  { value: "resume", label: "Resume" },
  { value: "job_description", label: "Job description" },
  { value: "company", label: "Company" },
  { value: "topics", label: "Topics" },
  { value: "question_bank", label: "Most asked questions" },
] as const;

export type TInterviewFocusType = (typeof FOCUS_TYPE_OPTIONS)[number]["value"];

export const INTERVIEW_MODE_OPTIONS = [
  { value: "qa_flow", label: "Q&A Flow" },
  { value: "interview_flow", label: "Interview Flow" },
];

export type TInterviewMode = (typeof INTERVIEW_MODE_OPTIONS)[number]["value"];

export interface IInterviewQuestion {
  questionText: string;
  answer?: string | null;
  notes?: string | null;
}

export interface ICreateInterviewDto {
  sessionId: string;
  mode: TInterviewMode;
  provider: string;
  model?: string | null;
  focusTypes?: TInterviewFocusType[];
  topicNames?: string[];
  questionCount?: number;
  maxDurationMinutes?: number;
}

export interface ICreateInterviewResponse {
  interview: IInterview;
  questions: IInterviewQuestion[];
}

interface IQuestionWithAnswer {
  questionId: number;
  question: string;
  answer: string;
  seconds: number;
}

export interface ICompleteInterviewDto {
  provider: string;
  model?: string | null;
  transcript: IQuestionWithAnswer[];
  elapsedSeconds: number;
}

export interface IFollowUpDto {
  provider: string;
  model?: string | null;
  answers: IQuestionWithAnswer[];
}

export interface IInterview {
  id: string;
  sessionId: string;
  userId?: string | null;
  mode: TInterviewMode;
  focusTypes?: string[] | null;
  topicNames?: string[] | null;
  startedAt: string;
  completedAt?: string | null;
  overallScore?: number | null;
  technicalScore?: number | null;
  communicationScore?: number | null;
  problemSolvingScore?: number | null;
  leadershipFitScore?: number | null;
  elapsedSeconds?: number | null;
  summaryMarkdown?: string | null;
  strengths?: string[] | null;
  improvements?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export const useGetInterview = (id: string) =>
  useSuspenseQuery({
    queryKey: queryKeys.interviews.detail(id),
    queryFn: async () => await api.get<IInterview>(`/${BACKEND_ROOT}/${id}`),
  });

export const useGetInterviewQuery = (id?: string) =>
  useQuery({
    queryKey: queryKeys.interviews.detail(id ?? ""),
    queryFn: async () => await api.get<IInterview>(`/${BACKEND_ROOT}/${id}`),
    enabled: !!id,
  });

export const useGetSessionInterviews = (sessionId: string) =>
  useSuspenseQuery({
    queryKey: queryKeys.interviews.bySession(sessionId),
    queryFn: async () =>
      await api.get<IInterview[]>(`/${BACKEND_ROOT}?sessionId=${sessionId}`),
  });

export const useCreateInterview = () =>
  useMutation({
    mutationFn: async (dto: ICreateInterviewDto) =>
      await api.post<ICreateInterviewResponse>(`/${BACKEND_ROOT}`, dto, {
        timeoutMs: 120_000,
      }),
    meta: { invalidates: queryKeys.interviews.all },
  });

export const useCompleteInterview = () =>
  useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: ICompleteInterviewDto & { id: string }) =>
      await api.post<IInterview>(`/${BACKEND_ROOT}/${id}/complete`, dto, {
        timeoutMs: 120_000,
      }),
    meta: { invalidates: queryKeys.interviews.all },
  });

export const useInterviewFollowUps = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IFollowUpDto & { id: string }) =>
      await api.post<IInterviewQuestion[]>(
        `/${BACKEND_ROOT}/${id}/follow-ups`,
        dto,
        { timeoutMs: 120_000 }
      ),
  });

export const useDeleteInterview = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/${BACKEND_ROOT}/${id}`);
    },
    meta: { invalidates: queryKeys.interviews.all },
  });

export const useLocalInterviewState = (interviewId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.interviews.draft(interviewId),
    queryFn: async () => await getLocalInterviewState(interviewId),
    enabled,
  });

export const useInterviewArchive = (interviewId: string, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.interviews.archive(interviewId),
    queryFn: async () => await getInterviewArchive(interviewId),
    enabled,
  });

export const useSetLocalInterviewState = () =>
  useMutation({
    mutationFn: async (state: ILocalInterviewState) => {
      await setLocalInterviewState(state);
      return state;
    },
    onSuccess: (state) => {
      apiClient.setQueryData<ILocalInterviewState | null>(
        queryKeys.interviews.draft(state.interviewId),
        state
      );
    },
  });

export const useArchiveLocalInterviewState = () =>
  useMutation({
    mutationFn: async (state: ILocalInterviewState) => {
      await archiveLocalInterviewState(state);
      return state;
    },
    onSuccess: (state) => {
      apiClient.setQueryData<ILocalInterviewState | null>(
        queryKeys.interviews.archive(state.interviewId),
        state
      );
      apiClient.setQueryData<ILocalInterviewState | null>(
        queryKeys.interviews.draft(state.interviewId),
        null
      );
    },
  });

export const useClearLocalInterviewState = () =>
  useMutation({
    mutationFn: async (interviewId: string) => {
      await clearLocalInterviewState(interviewId);
      return interviewId;
    },
    onSuccess: (interviewId) => {
      apiClient.setQueryData<ILocalInterviewState | null>(
        queryKeys.interviews.draft(interviewId),
        null
      );
    },
  });

export const useClearInterviewArchive = () =>
  useMutation({
    mutationFn: async (interviewId: string) => {
      await clearInterviewArchive(interviewId);
      return interviewId;
    },
    onSuccess: (interviewId) => {
      apiClient.setQueryData<ILocalInterviewState | null>(
        queryKeys.interviews.archive(interviewId),
        null
      );
    },
  });
