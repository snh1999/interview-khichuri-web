import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode, Suspense, useMemo } from "react";
import { describe, expect, it } from "vitest";
import {
  useAddQuestion,
  useCreateSession,
  useDeleteQuestion,
  useDeleteSession,
  useGenerateQuestions,
  useQuestions,
  useSession,
  useSessionQuery,
  useSessions,
  useUpdateQuestion,
  useUpdateSession,
} from "@/api/sessions/index.ts";
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

describe("session queries", () => {
  it("fetches sessions", async () => {
    server.use(http.get(`${API}/prep-session`, () => envelope([])));
    const { result } = renderHook(() => useSessions(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it("fetches a session", async () => {
    server.use(
      http.get(`${API}/prep-session/s-1`, () => envelope({ id: "s-1" }))
    );
    const { result } = renderHook(() => useSession("s-1"), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe("s-1"));
  });

  it("does not fetch an optional session without an id", () => {
    const { result } = renderHook(() => useSessionQuery(undefined), {
      wrapper,
    });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches a session's questions", async () => {
    const seen: string[] = [];
    server.use(
      http.get(`${API}/prep-session/s-1/questions`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope([{ id: 1 }]);
      })
    );
    const { result } = renderHook(() => useQuestions("s-1"), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(seen).toEqual(["/api/v1/prep-session/s-1/questions"]);
  });
});

describe("session mutations", () => {
  const route = (
    endpoint: string,
    method: "post" | "patch" | "delete",
    seen: string[]
  ) => {
    server.use(
      http[method](`${API}${endpoint}`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope(null);
      })
    );
  };

  it("creates and updates a session", async () => {
    const seen: string[] = [];
    route("/prep-session", "post", seen);
    route("/prep-session/s-1", "patch", seen);
    const { result } = renderHook(
      () => ({ create: useCreateSession(), update: useUpdateSession() }),
      { wrapper }
    );
    await act(async () => {
      await result.current.create.mutateAsync({ title: "S" });
      await result.current.update.mutateAsync({ id: "s-1", title: "S2" });
    });
    expect(seen).toEqual(["/api/v1/prep-session", "/api/v1/prep-session/s-1"]);
  });

  it("deletes a session", async () => {
    const seen: string[] = [];
    route("/prep-session/s-1", "delete", seen);
    const { result } = renderHook(() => useDeleteSession(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("s-1");
    });
    expect(seen).toEqual(["/api/v1/prep-session/s-1"]);
  });

  it("adds, updates and deletes questions", async () => {
    const seen: string[] = [];
    route("/prep-session/s-1/questions", "post", seen);
    route("/prep-session/s-1/questions/2", "patch", seen);
    route("/prep-session/s-1/questions/2", "delete", seen);
    const { result } = renderHook(
      () => ({
        add: useAddQuestion(),
        remove: useDeleteQuestion(),
        update: useUpdateQuestion(),
      }),
      { wrapper }
    );
    await act(async () => {
      await result.current.add.mutateAsync({ sessionId: "s-1" } as never);
      await result.current.update.mutateAsync({
        questionId: 2,
        sessionId: "s-1",
      });
      await result.current.remove.mutateAsync({
        questionId: 2,
        sessionId: "s-1",
      });
    });
    expect(seen).toEqual([
      "/api/v1/prep-session/s-1/questions",
      "/api/v1/prep-session/s-1/questions/2",
      "/api/v1/prep-session/s-1/questions/2",
    ]);
  });

  it("generates questions", async () => {
    const seen: string[] = [];
    route("/prep-session/s-1/generate", "post", seen);
    const { result } = renderHook(() => useGenerateQuestions(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "s-1", provider: "openai" });
    });
    expect(seen).toEqual(["/api/v1/prep-session/s-1/generate"]);
  });
});
