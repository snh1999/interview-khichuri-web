import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api";
import { api } from "@/lib/api-client.ts";

export type TEventSource = "deadline" | "interview" | "applied" | "custom";

export interface ICalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  source: "custom" | "job";
  sourceId?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCalendarEventDto {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  source?: TEventSource;
  sourceId?: string | null;
  color?: string | null;
}

export interface IUpdateCalendarEventDto {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  color?: string | null;
}

export const useCalendarEvents = () =>
  useSuspenseQuery({
    queryKey: queryKeys.calendar.events,
    queryFn: async () => await api.get<ICalendarEvent[]>("/calendar/events"),
  });

export const useCreateCalendarEvent = () =>
  useMutation({
    mutationFn: async (dto: ICreateCalendarEventDto) =>
      await api.post<ICalendarEvent>("/calendar/events", dto),
    meta: { invalidates: queryKeys.calendar.events },
  });

export const useUpdateCalendarEvent = () =>
  useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: IUpdateCalendarEventDto & { id: string }) =>
      await api.patch<ICalendarEvent>(`/calendar/events/${id}`, dto),
    meta: { invalidates: queryKeys.calendar.events },
  });

export const useDeleteCalendarEvent = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/calendar/events/${id}`);
    },
    meta: { invalidates: queryKeys.calendar.events },
  });
