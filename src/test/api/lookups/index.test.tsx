import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode, Suspense, useMemo } from "react";
import { describe, expect, it } from "vitest";
import {
  useBatchCreateLookups,
  useCategories,
  useCompanies,
  useCreateLookup,
  useDeleteLookup,
  useIndustries,
  useLookups,
  useRoles,
  useTopics,
  useUpdateLookup,
} from "@/api/lookups/index.ts";
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

describe("lookup queries", () => {
  it.each([
    ["categories", useCategories],
    ["roles", useRoles],
    ["topics", useTopics],
    ["industries", useIndustries],
  ] as const)("fetches the %s lookup", async (schema, useHook) => {
    const seen: string[] = [];
    server.use(
      http.get(`${API}/lookups/${schema}`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope([{ id: 1, name: "A", isApproved: true }]);
      })
    );
    const { result } = renderHook(() => useHook(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(seen).toEqual([`/api/v1/lookups/${schema}`]);
  });

  it("uses the parameterised lookups hook", async () => {
    server.use(http.get(`${API}/lookups/topics`, () => envelope([])));
    const { result } = renderHook(() => useLookups("topics"), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it("fetches companies", async () => {
    server.use(
      http.get(`${API}/company`, () => envelope([{ id: "c-1", name: "Acme" }]))
    );
    const { result } = renderHook(() => useCompanies(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
  });
});

describe("lookup mutations", () => {
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

  it("batch creates lookups", async () => {
    const seen: string[] = [];
    route("/lookups/topics/batch", "post", seen);
    const { result } = renderHook(() => useBatchCreateLookups("topics"), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync(["a", "b"]);
    });
    expect(seen).toEqual(["/api/v1/lookups/topics/batch"]);
  });

  it("creates a lookup", async () => {
    const seen: string[] = [];
    route("/lookups/roles", "post", seen);
    const { result } = renderHook(() => useCreateLookup("roles"), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ name: "Dev" });
    });
    expect(seen).toEqual(["/api/v1/lookups/roles"]);
  });

  it("updates a lookup", async () => {
    const seen: string[] = [];
    route("/lookups/roles/5", "patch", seen);
    const { result } = renderHook(() => useUpdateLookup("roles"), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync({ id: 5, name: "Dev" });
    });
    expect(seen).toEqual(["/api/v1/lookups/roles/5"]);
  });

  it("deletes a lookup", async () => {
    const seen: string[] = [];
    route("/lookups/roles/5", "delete", seen);
    const { result } = renderHook(() => useDeleteLookup("roles"), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync(5);
    });
    expect(seen).toEqual(["/api/v1/lookups/roles/5"]);
  });
});
