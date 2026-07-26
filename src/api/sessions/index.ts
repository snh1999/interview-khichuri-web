import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client";

export interface ICreateSessionDto {
  title: string;
  description: string;
  experience?: string | null;
  jobId?: string | null;
  roleId?: number | null;
  topicIds?: number[] | null;
}

export interface IUpdateSessionDto extends Partial<ICreateSessionDto> {}

export interface IPrepSession extends ICreateSessionDto {
  id: string;
  userId?: string | null;
  jobId?: string | null;
  createdAt: string;
  updatedAt: string;
  sessionTopics?: Array<{ topicId: number }>;
}

export interface ICreateQuestionDto {
  questionText: string;
  answer?: string | null;
  notes?: string | null;
  isFavorite: boolean;
}

export interface IUpdateQuestionDto extends Partial<ICreateQuestionDto> {}

export interface IQuestion extends ICreateQuestionDto {
  id: number;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISessionWithQuestions extends IPrepSession {
  questions: IQuestion[];
}

export const useSessions = () =>
  useSuspenseQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: async () => await api.get<IPrepSession[]>("/prep-session"),
  });

export const useSession = (id: string) =>
  useSuspenseQuery({
    queryKey: queryKeys.sessions.detail(id),
    queryFn: async () =>
      await api.get<ISessionWithQuestions>(`/prep-session/${id}`),
  });

export const useSessionQuery = (id?: string) =>
  useQuery({
    queryKey: queryKeys.sessions.detail(id ?? ""),
    queryFn: async () =>
      await api.get<ISessionWithQuestions>(`/prep-session/${id}`),
    enabled: !!id,
  });

export const useCreateSession = () =>
  useMutation({
    mutationFn: async (dto: ICreateSessionDto) =>
      await api.post<IPrepSession>("/prep-session", dto),
    meta: { invalidates: queryKeys.sessions.all },
  });

export const useUpdateSession = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IUpdateSessionDto & { id: string }) =>
      await api.patch<ISessionWithQuestions>(`/prep-session/${id}`, dto),
    meta: { invalidates: queryKeys.sessions.all },
  });

export const useDeleteSession = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/prep-session/${id}`);
    },
    meta: { invalidates: queryKeys.sessions.all },
  });

export const useQuestions = (sessionId: string) =>
  useSuspenseQuery({
    queryKey: [...queryKeys.sessions.all, "questions", sessionId] as const,
    queryFn: async () =>
      await api.get<IQuestion[]>(`/prep-session/${sessionId}/questions`),
  });

export const useAddQuestion = () =>
  useMutation({
    mutationFn: async ({
      sessionId,
      ...dto
    }: ICreateQuestionDto & { sessionId: string }) =>
      await api.post<IQuestion>(`/prep-session/${sessionId}/questions`, dto),
    meta: { invalidates: queryKeys.sessions.all },
  });

export const useUpdateQuestion = () =>
  useMutation({
    mutationFn: async ({
      sessionId,
      questionId,
      ...dto
    }: IUpdateQuestionDto & { sessionId: string; questionId: number }) =>
      await api.patch<IQuestion>(
        `/prep-session/${sessionId}/questions/${questionId}`,
        dto
      ),
    meta: { invalidates: queryKeys.sessions.all },
  });

export const useDeleteQuestion = () =>
  useMutation({
    mutationFn: async ({
      sessionId,
      questionId,
    }: {
      sessionId: string;
      questionId: number;
    }) => {
      await api.delete(`/prep-session/${sessionId}/questions/${questionId}`);
    },
    meta: { invalidates: queryKeys.sessions.all },
  });

export const useGenerateQuestions = () =>
  useMutation({
    mutationFn: async ({
      id,
      provider,
      model,
      count,
      avoidRepeat,
      includeJobDescription,
    }: {
      id: string;
      provider: string;
      model?: string;
      count?: number;
      avoidRepeat?: boolean;
      includeJobDescription?: boolean;
    }) =>
      await api.post<ISessionWithQuestions>(
        `/prep-session/${id}/generate`,
        { provider, model, count, avoidRepeat, includeJobDescription },
        { timeoutMs: 120_000 }
      ),
    meta: { invalidates: queryKeys.sessions.all },
  });
