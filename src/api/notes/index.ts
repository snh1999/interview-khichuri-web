import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client";

export type TNoteLinkKind = "job" | "question" | "none";

export const noteLinkKind = (note: INote): TNoteLinkKind => {
  if (note.jobId) {
    return "job";
  }
  if (note.questionId) {
    return "question";
  }
  return "none";
};

export interface ICreateNoteDto {
  title: string;
  details?: string | null;
  questionId?: number | null;
  jobId?: string | null;
  isFavorite?: boolean;
}

export interface IUpdateNoteDto {
  title?: string;
  details?: string | null;
  isFavorite?: boolean;
}

export interface INote extends ICreateNoteDto {
  id: string;
  userId: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  jobTitle?: string;
}

export interface ILearnMoreResult {
  markdown: string;
}

export interface INotesQuery {
  isFavorite?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

const toQueryString = (query?: INotesQuery): string => {
  const params = new URLSearchParams();
  if (query?.isFavorite !== undefined) {
    params.set("isFavorite", String(query.isFavorite));
  }
  if (query?.search) {
    params.set("search", query.search);
  }
  if (query?.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query?.limit !== undefined) {
    params.set("limit", String(query.limit));
  }
  return params.toString();
};

export const useNotes = (query?: INotesQuery) =>
  useSuspenseQuery({
    queryKey: queryKeys.notes.list(query),
    queryFn: async () => {
      const qs = toQueryString(query);
      return await api.get<INote[]>(`/notes${qs ? `?${qs}` : ""}`);
    },
  });

export const useGetNote = (id?: string) =>
  useQuery({
    queryKey: queryKeys.notes.detail(id ?? ""),
    queryFn: async () => await api.get<INote>(`/notes/${id}`),
    enabled: Boolean(id),
  });

export const useCreateNote = () =>
  useMutation({
    mutationFn: async (dto: ICreateNoteDto) =>
      await api.post<INote>("/notes", dto),
    meta: { invalidates: queryKeys.notes.list() },
  });

export const useUpdateNote = () =>
  useMutation({
    mutationFn: async ({ id, ...dto }: IUpdateNoteDto & { id: string }) =>
      await api.patch<INote>(`/notes/${id}`, dto),
    meta: {
      invalidates: ({ id }: { id: string }) =>
        queryKeys.notes.detailsAndList(id),
    },
  });

export const useDeleteNote = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    meta: {
      invalidates: queryKeys.notes.list(),
      removes: (id: string) => queryKeys.notes.detail(id),
    },
  });

export const useLearnMore = () =>
  useMutation({
    mutationFn: async (dto: {
      questionText: string;
      provider: string;
      model?: string | null;
    }) =>
      await api.post<ILearnMoreResult>("/notes/learn-more", dto, {
        timeoutMs: 120_000,
      }),
  });
