import { useCallback, useMemo } from "react";
import { useCalendarEvents as useBackendCalendarEvents } from "@/api/calendar";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense.tsx";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard.tsx";
import { CalendarHeader } from "@/components/dashboard/calendar/CalendarHeader.tsx";
import type {
  TCustomEvent,
  TEventColor,
  TJobEvent,
} from "@/components/dashboard/calendar/calendar.types.ts";
import { DayView } from "@/components/dashboard/calendar/DayView.tsx";
import { EventDrawlog } from "@/components/dashboard/calendar/EventDrawlog.tsx";
import { MonthGrid } from "@/components/dashboard/calendar/MonthGrid.tsx";
import { UpsertEventForm } from "@/components/dashboard/calendar/upsertEvent/UpsertEventForm.tsx";
import { useGetJobEvents } from "@/components/dashboard/calendar/useGetJobEvents.ts";
import { WeekView } from "@/components/dashboard/calendar/WeekView.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useCalendarStore } from "@/store/calendarStore.ts";

export const CalendarSection = () => (
  <AppErrorSuspense fallback={CalendarSkeleton}>
    <ScheduleContent />
  </AppErrorSuspense>
);

const ScheduleContent = () => {
  const { viewMode, visibility, openCreateDrawer, openEventList } =
    useCalendarStore();

  const jobEvents = useGetJobEvents(visibility);
  const { data: calendarEvents } = useBackendCalendarEvents();

  const allEvents = useMemo(
    () => [
      ...jobEvents,
      ...calendarEvents
        .filter((e) => e.source === "custom" && visibility.custom)
        .map((e) => ({
          ...e,
          source: "custom" as const,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
          color: e.color as TEventColor | null,
        })),
    ],
    [jobEvents, calendarEvents, visibility]
  );

  const handleSlotSelect = useCallback(
    (start: Date, end: Date, allDay = false) => {
      openCreateDrawer({ startDate: start, endDate: end, allDay });
    },
    [openCreateDrawer]
  );

  const handleEventClick = useCallback(
    (events: (TJobEvent | TCustomEvent)[], date: Date) => {
      openEventList(events, date);
    },
    [openEventList]
  );

  const handleDateRangeSelect = useCallback(
    (start: Date, end: Date) => {
      handleSlotSelect(start, end, true);
    },
    [handleSlotSelect]
  );

  const renderView = () => {
    if (viewMode === "week") {
      return (
        <WeekView
          events={allEvents}
          onCustomEventClick={handleEventClick}
          onSlotSelect={handleSlotSelect}
        />
      );
    }
    if (viewMode === "day") {
      return (
        <DayView
          events={allEvents}
          onCustomEventClick={handleEventClick}
          onSlotSelect={handleSlotSelect}
        />
      );
    }
    return (
      <MonthGrid
        events={allEvents}
        onCustomEventClick={handleEventClick}
        onDateRangeSelect={handleDateRangeSelect}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="rounded-lg border bg-card p-6">
        <CalendarHeader />

        <div className="mt-4">{renderView()}</div>

        {allEvents.length === 0 && (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No events this month</EmptyTitle>
              <EmptyDescription>
                Add jobs with deadlines or interview dates to see them here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <UpsertEventForm />
      <EventDrawlog />
    </div>
  );
};

const CalendarSkeleton = () => (
  <div className="w-full">
    <div className="mb-6">
      <Skeleton className="h-8 w-32" />
    </div>
    <SkeletonCard>
      <Skeleton className="h-96 w-full" />
    </SkeletonCard>
  </div>
);
