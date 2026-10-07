import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode, Suspense, useMemo } from "react";
import { describe, expect, it } from "vitest";
import {
  useAtsScoreEntries,
  useCachedStandaloneReview,
  useReviewResumeStandalone,
  useScoreResume,
} from "@/api/resumes/idb.ts";
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

const SCORE = {
  categories: [],
  matchedKeywords: [],
  missingKeywords: [],
  overall: 88,
  recommendations: [],
  tailoringNotes: "",
};

const REVIEW = { categories: [], overall: 70 };

describe("resume idb queries", () => {
  it("reads cached ats score entries", async () => {
    const { result } = renderHook(() => useAtsScoreEntries(), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
  });

  it("reads a cached standalone review", async () => {
    const { result } = renderHook(() => useCachedStandaloneReview("r-1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
  });
});

describe("resume idb mutations", () => {
  it("scores a resume and caches the result", async () => {
    const seen: string[] = [];
    server.use(
      http.post(`${API}/resume/score`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope(SCORE);
      })
    );
    const { result } = renderHook(() => useScoreResume(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        jobId: "j-1",
        provider: "openai",
        resumeId: "r-1",
      });
    });
    expect(seen).toEqual(["/api/v1/resume/score"]);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("reviews a resume standalone and caches the result", async () => {
    const seen: string[] = [];
    server.use(
      http.post(`${API}/resume/review-standalone`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope(REVIEW);
      })
    );
    const { result } = renderHook(() => useReviewResumeStandalone(), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync({ provider: "openai", resumeId: "r-1" });
    });
    expect(seen).toEqual(["/api/v1/resume/review-standalone"]);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
