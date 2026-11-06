import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { type ReactNode, Suspense, useMemo } from "react";
import { afterEach, describe, expect, it, it as test } from "vitest";
import {
  type TJobSortKey,
  useCompanyJobs,
  useDiscoverJobs,
  useGetJobs,
} from "@/api/jobs";
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

test("omits empty query strings for default discover and company lists", async () => {
  const seen: string[] = [];
  server.use(
    http.get("*/api/v1/jobs/discover", ({ request }) => {
      seen.push(new URL(request.url).pathname + new URL(request.url).search);
      return HttpResponse.json({ data: [], message: "OK", statusCode: 200 });
    }),
    http.get("*/api/v1/company/:id/jobs", ({ request }) => {
      seen.push(new URL(request.url).pathname + new URL(request.url).search);
      return HttpResponse.json({ data: [], message: "OK", statusCode: 200 });
    })
  );

  renderHook(
    () => {
      useDiscoverJobs();
      useCompanyJobs(7);
    },
    { wrapper }
  );

  await waitFor(() => expect(seen).toHaveLength(2));
  expect(seen).toContain("/api/v1/jobs/discover");
  expect(seen).toContain("/api/v1/company/7/jobs");
});
