import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addMinutes, format, isSameDay, startOfDay } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  type ICalendarEvent,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
} from "@/api/calendar";
import type { IFormHook } from "@/components/common/form/form.types.ts";
import {
  DEFAULT_CLICK_DURATION_MINUTES,
  isAllDayEvent,
} from "../calendar.helpers";
import type { TCustomEvent, TDrawerPrefill } from "../calendar.types.ts";

export const upsertEventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required").max(500),
    endDate: z.date(),
    // TODO: add those fields
    // googleTitle: z.string().max(200).optional(),
    // privateSync: z.boolean().optional(),
    startDate: z.date(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate.getTime() <= data.startDate.getTime()) {
      ctx.addIssue({
        code: "custom",
        message: "End must be after start",
        path: ["endDate"],
      });
    }
  });

export type TUpsertEventFormData = z.infer<typeof upsertEventSchema>;

const MIN_RANGE_MS = DEFAULT_CLICK_DURATION_MINUTES * 60_000;

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
    description: editingEvent.description,
    startDate: editingEvent.startDate,
    endDate: editingEvent.endDate,
  }),
});

const onSuccess = (message: string) => (event: ICalendarEvent) =>
  toast.success(message, {
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
  // Editing an existing all-day event (persisted as midnight-to-midnight)
  // must open with the toggle ON; prefills keep their own session semantics.
  const [allDay, setAllDay] = useState(() =>
    event ? isAllDayEvent(event) : !(event || prefill)
  );
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

  // Duration-preserving auto-correction: whichever bound the user moves past
  // the other drags the opposite bound along, floored at one default slot so
  // zero-length ranges are impossible. The schema superRefine stays as a
  // backstop for any path this doesn't cover.
  const prevRangeRef = useRef({ end: endDate, start: startDate });
  useEffect(() => {
    const prev = prevRangeRef.current;
    const startChanged = startDate.getTime() !== prev.start.getTime();
    const endChanged = endDate.getTime() !== prev.end.getTime();
    if (!(startChanged || endChanged)) {
      return;
    }
    const durationMs = Math.max(
      prev.end.getTime() - prev.start.getTime(),
      MIN_RANGE_MS
    );
    if (startChanged && startDate.getTime() >= endDate.getTime()) {
      const nextEnd = new Date(startDate.getTime() + durationMs);
      form.setValue("endDate", nextEnd);
      prevRangeRef.current = { end: nextEnd, start: startDate };
      return;
    }
    if (endChanged && endDate.getTime() <= startDate.getTime()) {
      const nextStart = new Date(endDate.getTime() - durationMs);
      form.setValue("startDate", nextStart);
      prevRangeRef.current = { end: endDate, start: nextStart };
      return;
    }
    prevRangeRef.current = { end: endDate, start: startDate };
  }, [startDate, endDate, form]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setAllDay(event ? isAllDayEvent(event) : !(event || prefill));
    form.reset(buildDefaultValues(prefill, event));
  }, [open, event, prefill, form]);

  const handleSubmit = form.handleSubmit(async (data: TUpsertEventFormData) => {
    const payload = { ...data, source: event ? event.source : "custom" };

    try {
      if (event) {
        await updateEvent(
          { ...payload, id: event.id },
          { onSuccess: onSuccess("EventUpdated") }
        );
      } else {
        await createEvent(payload, { onSuccess: onSuccess("Event Created") });
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
