import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode, Suspense, useMemo } from "react";
import { describe, expect, it } from "vitest";
import {
  noteLinkKind,
  useCreateNote,
  useDeleteNote,
  useGetNote,
  useLearnMore,
  useNotes,
  useUpdateNote,
} from "@/api/notes/index.ts";
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

describe("noteLinkKind", () => {
  it("prefers a job link, then a question, else none", () => {
    expect(noteLinkKind({ id: "n", jobId: "j", title: "" } as never)).toBe(
      "job"
    );
    expect(noteLinkKind({ id: "n", questionId: 2, title: "" } as never)).toBe(
      "question"
    );
    expect(noteLinkKind({ id: "n", title: "" } as never)).toBe("none");
  });
});

describe("note queries", () => {
  it("serialises filters into the query string", async () => {
    let search = "";
    server.use(
      http.get(`${API}/notes`, ({ request: { url } }) => {
        const { search: qs } = new URL(url);
        search = qs;
        return envelope([]);
      })
    );
    const { result } = renderHook(
      () => useNotes({ isFavorite: true, limit: 10, page: 2, search: "alg" }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.data).toEqual([]));
    expect(search).toBe("?isFavorite=true&search=alg&page=2&limit=10");
  });

  it("does not fetch a note without an id", () => {
    const { result } = renderHook(() => useGetNote(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches a note by id", async () => {
    server.use(http.get(`${API}/notes/n-1`, () => envelope({ id: "n-1" })));
    const { result } = renderHook(() => useGetNote("n-1"), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe("n-1"));
  });
});

describe("note mutations", () => {
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

  it("creates a note", async () => {
    const seen: string[] = [];
    route("/notes", "post", seen);
    const { result } = renderHook(() => useCreateNote(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ title: "N" });
    });
    expect(seen).toEqual(["/api/v1/notes"]);
  });

  it("updates a note", async () => {
    const seen: string[] = [];
    route("/notes/n-1", "patch", seen);
    const { result } = renderHook(() => useUpdateNote(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "n-1", title: "N" });
    });
    expect(seen).toEqual(["/api/v1/notes/n-1"]);
  });

  it("deletes a note", async () => {
    const seen: string[] = [];
    route("/notes/n-1", "delete", seen);
    const { result } = renderHook(() => useDeleteNote(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("n-1");
    });
    expect(seen).toEqual(["/api/v1/notes/n-1"]);
  });

  it("requests a learn-more explanation", async () => {
    const seen: string[] = [];
    route("/notes/learn-more", "post", seen);
    const { result } = renderHook(() => useLearnMore(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        provider: "openai",
        questionText: "Q",
      });
    });
    expect(seen).toEqual(["/api/v1/notes/learn-more"]);
  });
});
