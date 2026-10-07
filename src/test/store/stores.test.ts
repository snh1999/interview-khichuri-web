import { beforeEach, describe, expect, it } from "vitest";
import type { TCustomEvent } from "@/components/dashboard/calendar/calendar.types.ts";
import { useAppStore } from "@/store/appStore.ts";
import { useCalendarStore } from "@/store/calendarStore.ts";
import { useInterviewStore } from "@/store/interviewStore.ts";
import { useResumeStore } from "@/store/resumeStore.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";

const CALENDAR_INIT = useCalendarStore.getState();
const JOBS_INIT = useJobsStore.getState();
const INTERVIEW_INIT = useInterviewStore.getState();
const RESUME_INIT = useResumeStore.getState();
const APP_INIT = useAppStore.getState();

beforeEach(() => {
  useCalendarStore.setState(CALENDAR_INIT);
  useJobsStore.setState(JOBS_INIT);
  useInterviewStore.setState(INTERVIEW_INIT);
  useResumeStore.setState(RESUME_INIT);
  useAppStore.setState(APP_INIT);
});

describe("useCalendarStore", () => {
  const anchor = { day: 15, month: 5, year: 2024 };

  it("navigates by month, week and day", () => {
    useCalendarStore.setState({ anchor, viewMode: "month" });
    useCalendarStore.getState().goToNext();
    expect(useCalendarStore.getState().anchor).toMatchObject({
      month: 6,
      year: 2024,
    });

    useCalendarStore.setState({ anchor, viewMode: "week" });
    useCalendarStore.getState().goToNext();
    expect(useCalendarStore.getState().anchor).toEqual({
      day: 22,
      month: 5,
      year: 2024,
    });

    useCalendarStore.setState({ anchor, viewMode: "day" });
    useCalendarStore.getState().goToPrev();
    expect(useCalendarStore.getState().anchor).toEqual({
      day: 14,
      month: 5,
      year: 2024,
    });
  });

  it("returns to today", () => {
    useCalendarStore.setState({ anchor: { day: 1, month: 0, year: 2000 } });
    useCalendarStore.getState().goToToday();
    expect(useCalendarStore.getState().anchor.year).toBe(
      new Date().getFullYear()
    );
  });

  it("sets the view mode and toggles visibility", () => {
    useCalendarStore.getState().setViewMode("week");
    expect(useCalendarStore.getState().viewMode).toBe("week");

    const before = useCalendarStore.getState().visibility.applied;
    useCalendarStore.getState().toggleVisibility("applied");
    expect(useCalendarStore.getState().visibility.applied).toBe(!before);
  });

  it("opens and closes the create and edit drawers", () => {
    useCalendarStore.getState().openCreateDrawer({
      endDate: new Date(),
      startDate: new Date(),
    });
    expect(useCalendarStore.getState().drawerOpen).toBe(true);
    expect(useCalendarStore.getState().drawerPrefill).toBeDefined();

    const event = {
      description: "",
      endDate: new Date(),
      id: "e-1",
      source: "custom",
      startDate: new Date(),
      title: "E",
    } satisfies TCustomEvent;
    useCalendarStore.getState().openEditDrawer(event);
    expect(useCalendarStore.getState().editingEvent).toBe(event);

    useCalendarStore.getState().closeDrawer();
    expect(useCalendarStore.getState().drawerOpen).toBe(false);
    expect(useCalendarStore.getState().editingEvent).toBeUndefined();
  });

  it("opens and closes the event list", () => {
    const date = new Date(2024, 0, 1);
    useCalendarStore.getState().openEventList([], date);
    expect(useCalendarStore.getState().eventList).toEqual({ date, events: [] });

    useCalendarStore.getState().closeEventList();
    expect(useCalendarStore.getState().eventList).toBeUndefined();
  });
});

describe("useJobsStore", () => {
  it("stores search, status and sort", () => {
    useJobsStore.getState().setSearch("react");
    useJobsStore.getState().setStatus("applied");
    useJobsStore.getState().setSort("title:asc");

    const state = useJobsStore.getState();
    expect(state.search).toBe("react");
    expect(state.status).toBe("applied");
    expect(state.sort).toBe("title:asc");
  });

  it("handles preset, custom and cleared date changes", () => {
    useJobsStore.getState().setDateChange({
      kind: "preset",
      key: "this-month",
      type: "deadline",
    });
    let state = useJobsStore.getState();
    expect(state.datePreset).toBe("this-month");
    expect(state.dateType).toBe("deadline");
    expect(state.dateFrom).toBeUndefined();

    useJobsStore.getState().setDateChange({
      from: "2024-01-01",
      kind: "custom",
      to: "2024-01-31",
      type: "applied",
    });
    state = useJobsStore.getState();
    expect(state.datePreset).toBeUndefined();
    expect(state.dateFrom).toBe("2024-01-01");
    expect(state.dateTo).toBe("2024-01-31");

    useJobsStore.getState().setDateChange(undefined);
    expect(useJobsStore.getState().dateType).toBe("all");
    expect(useJobsStore.getState().dateFrom).toBeUndefined();
  });

  it("resets every filter", () => {
    useJobsStore.getState().setSearch("x");
    useJobsStore.getState().setStatus("saved");
    useJobsStore.getState().resetAll();

    const state = useJobsStore.getState();
    expect(state.search).toBe("");
    expect(state.status).toBeUndefined();
    expect(state.sort).toBe("default");
  });
});

describe("useInterviewStore", () => {
  it("toggles the camera pane", () => {
    useInterviewStore.getState().toggleCamera();
    expect(useInterviewStore.getState().panes.camera).toBe(false);
  });

  it("keeps chat on when the avatar is hidden", () => {
    useInterviewStore.getState().toggleAvatar();
    const hidden = useInterviewStore.getState().panes;
    expect(hidden.avatar).toBe(false);
    expect(hidden.chat).toBe(true);

    useInterviewStore.getState().toggleAvatar();
    const shown = useInterviewStore.getState().panes;
    expect(shown.avatar).toBe(true);
  });

  it("keeps the avatar on when chat is hidden", () => {
    useInterviewStore.getState().toggleChat();
    const { panes } = useInterviewStore.getState();
    expect(panes.chat).toBe(false);
    expect(panes.avatar).toBe(true);
  });
});

describe("useResumeStore", () => {
  it("sets and resets section configs per template", () => {
    const sections = [
      { enabled: true, id: "skills" as const, title: "Skills" },
    ];
    useResumeStore.getState().setSections("jakes", sections);
    expect(useResumeStore.getState().sections.jakes).toEqual(sections);

    useResumeStore.getState().resetSections("jakes");
    expect(useResumeStore.getState().sections.jakes).toBeUndefined();
  });
});

describe("useAppStore", () => {
  it("stores avatar, header and profile values", () => {
    const store = useAppStore.getState();
    store.setAvatar("pixel");
    store.setPageHeader("Dashboard");
    store.setDefaultAiProvider({ provider: "google" });
    store.setSkipAiDialog(true);
    store.setUserId("u-1");

    const state = useAppStore.getState();
    expect(state.avatar).toBe("pixel");
    expect(state.pageHeader).toBe("Dashboard");
    expect(state.defaultAiProvider).toEqual({ provider: "google" });
    expect(state.skipAiDialog).toBe(true);
    expect(state.userId).toBe("u-1");
  });
});
