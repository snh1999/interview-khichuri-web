import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addMinutes, format, isSameDay, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  type ICalendarEvent,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
} from "@/api/calendar";
import type { IFormHook } from "@/components/common/form/form.types.ts";
import type { TCustomEvent, TDrawerPrefill } from "../calendar.types.ts";

export const upsertEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required").max(500),
  endDate: z.date(),
  // TODO: add those fields
  // googleTitle: z.string().max(200).optional(),
  // privateSync: z.boolean().optional(),
  startDate: z.date(),
});

export type TUpsertEventFormData = z.infer<typeof upsertEventSchema>;

const buildDefaultValues = (
  prefill?: TDrawerPrefill,
  editingEvent?: TCustomEvent
): DefaultValues<TUpsertEventFormData> => ({
  title: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
  ...prefill,
  ...(editingEvent && {
    title: editingEvent.title,
    description: editingEvent.description ?? "",
    startDate: editingEvent.startDate,
    endDate: editingEvent.endDate,
  }),
});

const onSuccess = (event: ICalendarEvent) =>
  toast.success(event ? "Event updated" : "Event added", {
    description: `${event.title} — ${format(event.startDate, "MMM d, yyyy")}`,
  });

interface IProps {
  prefill?: TDrawerPrefill;
  event?: TCustomEvent;
  open: boolean;
  closeDrawLog: () => void;
}

export const useUpsertEventForm = ({
  prefill,
  event,
  open,
  closeDrawLog,
}: IProps): IFormHook<TUpsertEventFormData> & {
  allDay: boolean;
  isMultiDay: boolean;
  handlePreset: (minutes: number) => void;
  handleAllDay: () => void;
} => {
  const [allDay, setAllDay] = useState(() => !(event || prefill));
  const { mutateAsync: createEvent, isPending: isCreatePending } =
    useCreateCalendarEvent();
  const { mutateAsync: updateEvent, isPending: isUpdatePending } =
    useUpdateCalendarEvent();
  const isLoading = isCreatePending || isUpdatePending;

  const form = useForm<TUpsertEventFormData>({
    defaultValues: buildDefaultValues(prefill, event),
    resolver: zodResolver(upsertEventSchema),
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  useEffect(() => {
    if (!open) {
      return;
    }
    setAllDay(!(event || prefill));
    form.reset(buildDefaultValues(prefill, event));
  }, [open, event, prefill, form]);

  const handleSubmit = form.handleSubmit(async (data: TUpsertEventFormData) => {
    const payload = { ...data, source: event ? event.source : "custom" };

    try {
      if (event) {
        await updateEvent({ ...payload, id: event.id }, { onSuccess });
      } else {
        await createEvent(payload, { onSuccess });
      }
      closeDrawLog();
    } catch {
      toast.error(`Failed to ${event ? "Edit" : "Create"} event`);
    }
  });

  const handlePreset = (minutes: number) => {
    const start = new Date(startDate);
    const end = addMinutes(start, minutes);
    form.setValue("endDate", end);
    setAllDay(false);
  };

  const handleAllDay = () => {
    const start = startOfDay(new Date(startDate));
    const end = addDays(start, 1);
    form.setValue("startDate", start);
    form.setValue("endDate", end);
    setAllDay(true);
  };

  return {
    allDay,
    form,
    handleAllDay,
    handlePreset,
    isLoading,
    isMultiDay: !isSameDay(endDate, startDate),
    handleSubmit,
  };
};
