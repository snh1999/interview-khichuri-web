import { useCallback, useMemo } from "react";
import { useCalendarEvents as useBackendCalendarEvents } from "@/api/calendar";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import type {
  TCustomEvent,
  TJobEvent,
} from "@/components/calendar/calendar.types";
import { DayView } from "@/components/calendar/DayView";
import { EventDrawlog } from "@/components/calendar/EventDrawlog.tsx";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { UpsertEventForm } from "@/components/calendar/upsertEvent/UpsertEventForm.tsx";
import { useGetJobEvents } from "@/components/calendar/useGetJobEvents.ts";
import { WeekView } from "@/components/calendar/WeekView";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useScheduleStore } from "@/store/scheduleStore.ts";

export const SchedulePage = () => (
  <AppErrorSuspense fallback={SchedulePageSkeleton}>
    <ScheduleContent />
  </AppErrorSuspense>
);

const ScheduleContent = () => {
  const { viewMode, visibility, openCreateDrawer, openEventList } =
    useScheduleStore();

  const jobEvents = useGetJobEvents(visibility);
  const { data: calendarEvents } = useBackendCalendarEvents();

  const allEvents = useMemo(
    () => [
      ...jobEvents,
      ...calendarEvents
        .filter((e) => e.source === "custom")
        .map((e) => ({
          ...e,
          source: "custom" as const,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
        })),
    ],
    [jobEvents, calendarEvents]
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-xl">Schedule</h1>
        {/* TODO: Restore <CalendarStatus /> once Google OAuth calendar.events scope is approved */}
      </div>

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

const SchedulePageSkeleton = () => (
  <div className="w-full">
    <div className="mb-6">
      <Skeleton className="h-8 w-32" />
    </div>
    <SkeletonCard>
      <Skeleton className="h-96 w-full" />
    </SkeletonCard>
  </div>
);
