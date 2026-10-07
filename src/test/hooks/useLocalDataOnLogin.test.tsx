import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalDataOnLogin } from "@/hooks/useLocalDataOnLogin.ts";
import { getArchivedValues, putArchivedValues } from "@/lib/storageArchive.ts";
import { useAppStore } from "@/store/appStore.ts";
import { useCalendarStore } from "@/store/calendarStore.ts";
import { useInterviewStore } from "@/store/interviewStore.ts";
import { useResumeStore } from "@/store/resumeStore.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";

const resetStores = () => {
  useAppStore.setState(useAppStore.getInitialState(), true);
  useInterviewStore.setState(useInterviewStore.getInitialState(), true);
  useResumeStore.setState(useResumeStore.getInitialState(), true);
  useCalendarStore.setState(useCalendarStore.getInitialState(), true);
  useJobsStore.setState(useJobsStore.getInitialState(), true);
};

const panes = (pane: string) => JSON.stringify({ state: { pane }, version: 1 });

const appTag = (userId: string) =>
  JSON.stringify({ state: { userId }, version: 0 });

const settle = async (result: { current: { isSwapping: boolean } }) => {
  await waitFor(() => expect(result.current.isSwapping).toBe(false), {
    timeout: 3000,
  });
};

describe("useLocalDataOnLogin", () => {
  beforeEach(() => {
    resetStores();
    localStorage.clear();
  });

  it("keeps the gate open when there is no signed-in user", () => {
    const { result } = renderHook(() => useLocalDataOnLogin(undefined));

    expect(result.current.isSwapping).toBe(false);
  });

  it("settles without swapping when the stored user matches", async () => {
    localStorage.setItem("app-store", appTag("u-same"));
    localStorage.setItem("interview-panes", panes("left"));

    const { result } = renderHook(() => useLocalDataOnLogin("u-same"));

    expect(result.current.isSwapping).toBe(true);
    await settle(result);

    expect(localStorage.getItem("interview-panes")).toBe(panes("left"));
    expect(result.current.isSwapping).toBe(false);
  });

  it("archives the outgoing user and restores the incoming user's values", async () => {
    localStorage.setItem("app-store", appTag("u-out-3"));
    localStorage.setItem("interview-panes", panes("out"));
    localStorage.setItem(
      "resume-store",
      JSON.stringify({ state: { title: "out" }, version: 0 })
    );
    await putArchivedValues("u-in-3", { "interview-panes": panes("in") });

    const { result } = renderHook(() => useLocalDataOnLogin("u-in-3"));
    await settle(result);

    expect(
      JSON.parse(localStorage.getItem("app-store") ?? "{}").state.userId
    ).toBe("u-in-3");
    expect(
      JSON.parse(localStorage.getItem("interview-panes") ?? "{}").state
    ).toEqual({ pane: "in" });
    expect(await getArchivedValues("u-out-3")).toEqual({
      "app-store": appTag("u-out-3"),
      "interview-panes": panes("out"),
      "resume-store": JSON.stringify({ state: { title: "out" }, version: 0 }),
    });
  });

  it("drops local keys when the incoming user has no archive", async () => {
    localStorage.setItem("app-store", appTag("u-out-4"));
    localStorage.setItem("interview-panes", panes("out"));

    const { result } = renderHook(() => useLocalDataOnLogin("u-in-4"));
    await settle(result);

    expect(
      JSON.parse(localStorage.getItem("app-store") ?? "{}").state.userId
    ).toBe("u-in-4");
    expect(localStorage.getItem("interview-panes")).toBeNull();
  });
});
