import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode, Suspense, useMemo } from "react";
import { describe, expect, it } from "vitest";
import {
  useAllInterviews,
  useArchiveLocalInterviewState,
  useClearInterviewArchive,
  useClearLocalInterviewState,
  useCompleteInterview,
  useCreateInterview,
  useDeleteInterview,
  useGetInterview,
  useGetInterviewQuery,
  useGetSessionInterviews,
  useInterviewArchive,
  useInterviewFollowUps,
  useLocalInterviewState,
  useSetLocalInterviewState,
} from "@/api/sessions/interviews.ts";
import type { ILocalInterviewState } from "@/lib/interviewStorage";
import { server } from "@/test/msw/server.ts";

const API = "*/api/v1";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: { retry: false },
          queries: { retry: false },
        },
      }),
    []
  );
  return (
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );
};

const state = {
  interviewId: "i-1",
  questions: [],
} as unknown as ILocalInterviewState;

describe("interview queries", () => {
  it("fetches an interview by id", async () => {
    server.use(
      http.get(`${API}/interviews/:id`, () => envelope({ id: "i-1" }))
    );
    const { result } = renderHook(() => useGetInterview("i-1"), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe("i-1"));
  });

  it("does not fetch an optional interview without an id", () => {
    const { result } = renderHook(() => useGetInterviewQuery(undefined), {
      wrapper,
    });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches interviews for a session", async () => {
    server.use(http.get(`${API}/interviews`, () => envelope([{ id: "i-1" }])));
    const { result } = renderHook(() => useGetSessionInterviews("s-1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
  });

  it("serialises the completed and limit filters", async () => {
    let search = "";
    server.use(
      http.get(`${API}/interviews`, ({ request: { url } }) => {
        search = new URL(url).search;
        return envelope([]);
      })
    );
    const { result } = renderHook(
      () => useAllInterviews({ completed: true, limit: 5 }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(search).toBe("?completed=true&limit=5");
  });

  it("reads local interview state", async () => {
    const { result } = renderHook(() => useLocalInterviewState("i-1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
  });
});

describe("interview mutations", () => {
  const route = (
    endpoint: string,
    method: "post" | "delete",
    seen: string[]
  ) => {
    server.use(
      http[method](`${API}${endpoint}`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope(null);
      })
    );
  };

  it("creates an interview", async () => {
    const seen: string[] = [];
    route("/interviews", "post", seen);
    const { result } = renderHook(() => useCreateInterview(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({} as never);
    });
    expect(seen).toEqual(["/api/v1/interviews"]);
  });

  it("completes an interview", async () => {
    const seen: string[] = [];
    route("/interviews/i-1/complete", "post", seen);
    const { result } = renderHook(() => useCompleteInterview(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "i-1" } as never);
    });
    expect(seen).toEqual(["/api/v1/interviews/i-1/complete"]);
  });

  it("requests follow-up questions", async () => {
    const seen: string[] = [];
    route("/interviews/i-1/follow-ups", "post", seen);
    const { result } = renderHook(() => useInterviewFollowUps(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "i-1" } as never);
    });
    expect(seen).toEqual(["/api/v1/interviews/i-1/follow-ups"]);
  });

  it("deletes an interview", async () => {
    const seen: string[] = [];
    route("/interviews/i-1", "delete", seen);
    const { result } = renderHook(() => useDeleteInterview(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("i-1");
    });
    expect(seen).toEqual(["/api/v1/interviews/i-1"]);
  });

  it("persists, archives and clears local state", async () => {
    const { result } = renderHook(
      () => ({
        archive: useArchiveLocalInterviewState(),
        clear: useClearLocalInterviewState(),
        clearArchive: useClearInterviewArchive(),
        set: useSetLocalInterviewState(),
      }),
      { wrapper }
    );

    await act(async () => {
      await result.current.set.mutateAsync(state);
      await result.current.archive.mutateAsync(state);
      await result.current.clear.mutateAsync("i-1");
      await result.current.clearArchive.mutateAsync("i-1");
    });

    expect(result.current.set.isSuccess).toBe(true);
  });

  it("reads the archive when enabled", async () => {
    const { result } = renderHook(() => useInterviewArchive("i-1", true), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
  });
});
