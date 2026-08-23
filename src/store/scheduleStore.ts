import { addDays, addMonths } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TEventSource } from "@/api/calendar";
import type {
  TCustomEvent,
  TDrawerPrefill,
  TEventVisibility,
  TJobEvent,
  TViewMode,
} from "@/components/calendar/calendar.types";

const INITIAL_VISIBILITY: TEventVisibility = {
  applied: true,
  custom: true,
  deadline: true,
  interview: true,
};

export interface TAnchorDate {
  year: number;
  month: number;
  day: number;
}

interface TEventList {
  date: Date;
  events: (TJobEvent | TCustomEvent)[];
}

interface IPersistedScheduleState {
  viewMode: TViewMode;
  visibility: TEventVisibility;
}

interface IScheduleState {
  anchor: TAnchorDate;
  viewMode: TViewMode;
  visibility: TEventVisibility;
  drawerOpen: boolean;
  drawerPrefill?: TDrawerPrefill;
  editingEvent?: TCustomEvent;
  eventList?: TEventList;

  goToPrev: () => void;
  goToNext: () => void;
  goToToday: () => void;
  setViewMode: (mode: TViewMode) => void;
  toggleVisibility: (source: TEventSource) => void;

  openCreateDrawer: (prefill?: TDrawerPrefill) => void;
  openEditDrawer: (event: TCustomEvent) => void;
  closeDrawer: () => void;

  openEventList: (events: (TJobEvent | TCustomEvent)[], date: Date) => void;
  closeEventList: () => void;
}

const toAnchor = (date: Date): TAnchorDate => ({
  day: date.getDate(),
  month: date.getMonth(),
  year: date.getFullYear(),
});

const shiftAnchor = (
  anchor: TAnchorDate,
  viewMode: TViewMode,
  direction: 1 | -1
): TAnchorDate => {
  const date = new Date(anchor.year, anchor.month, anchor.day);
  if (viewMode === "month") {
    return toAnchor(addMonths(date, direction));
  }
  const step = viewMode === "week" ? 7 : 1;
  return toAnchor(addDays(date, step * direction));
};

export const useScheduleStore = create<IScheduleState>()(
  persist(
    (set, get) => ({
      anchor: toAnchor(new Date()),
      visibility: INITIAL_VISIBILITY,
      viewMode: "month",
      drawerOpen: false,

      goToNext: () => {
        const { anchor, viewMode } = get();
        set({ anchor: shiftAnchor(anchor, viewMode, 1) });
      },

      goToPrev: () => {
        const { anchor, viewMode } = get();
        set({ anchor: shiftAnchor(anchor, viewMode, -1) });
      },

      goToToday: () => set({ anchor: toAnchor(new Date()) }),

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleVisibility: (source) =>
        set((state) => ({
          visibility: {
            ...state.visibility,
            [source]: !state.visibility[source],
          },
        })),

      openCreateDrawer: (prefill) =>
        set({
          drawerOpen: true,
          drawerPrefill: prefill,
          editingEvent: undefined,
        }),

      openEditDrawer: (event) =>
        set({
          drawerOpen: true,
          drawerPrefill: undefined,
          editingEvent: event,
          eventList: undefined,
        }),

      closeDrawer: () =>
        set({
          drawerOpen: false,
          drawerPrefill: undefined,
          editingEvent: undefined,
        }),

      openEventList: (events, date) => set({ eventList: { date, events } }),

      closeEventList: () => set({ eventList: undefined }),
    }),
    {
      name: "schedule-ui",
      version: 1,
      partialize: (state): IPersistedScheduleState => ({
        viewMode: state.viewMode,
        visibility: state.visibility,
      }),
    }
  )
);
