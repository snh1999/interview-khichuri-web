import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { type ReactNode, Suspense, useMemo } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { type TJobSortKey, useGetJobs } from "@/api/jobs";
import { server } from "@/test/msw/server.ts";

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    []
  );
  return (
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );
};

describe("useGetJobs sort mapping", () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it.each([
    ["interview", "interviewDate:asc"],
    ["applied", "appliedAt:desc"],
  ] as const)("sends the %s sort as %s", async (sort, expected) => {
    const seen: (string | null)[] = [];
    server.use(
      http.get("*/api/v1/jobs", ({ request }) => {
        seen.push(new URL(request.url).searchParams.get("sort"));
        return HttpResponse.json({ data: [], message: "OK", statusCode: 200 });
      })
    );

    renderHook(() => useGetJobs(sort as TJobSortKey), { wrapper });

    await waitFor(() => expect(seen).toEqual([expected]));
  });
});
