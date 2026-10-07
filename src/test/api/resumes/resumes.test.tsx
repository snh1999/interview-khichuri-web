import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode, Suspense, useMemo } from "react";
import { describe, expect, it } from "vitest";
import {
  useCreateResume,
  useDeleteResume,
  useExtractResume,
  useGetResumeById,
  useGetResumes,
  usePublicResume,
  useResumeViewUrl,
  useSetPrimaryResume,
  useUpdateResume,
  useUploadResume,
} from "@/api/resumes/index.ts";
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

describe("resume queries", () => {
  it("fetches the resume list", async () => {
    server.use(
      http.get(`${API}/resume`, () => envelope([{ id: "r-1", name: "CV" }]))
    );
    const { result } = renderHook(() => useGetResumes(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
  });

  it("fetches a resume by id", async () => {
    server.use(
      http.get(`${API}/resume/:id`, () => envelope({ id: "r-1", name: "CV" }))
    );
    const { result } = renderHook(() => useGetResumeById("r-1"), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe("r-1"));
  });

  it("fetches a public resume by slug", async () => {
    server.use(
      http.get(`${API}/resume/slug/:slug`, () =>
        envelope({ id: "r-1", slug: "ada" })
      )
    );
    const { result } = renderHook(() => usePublicResume("ada"), { wrapper });
    await waitFor(() => expect(result.current.data?.slug).toBe("ada"));
  });

  it("fetches a resume view url", async () => {
    server.use(
      http.get(`${API}/resume/:id/url`, () =>
        envelope({ url: "https://files/cv.pdf" })
      )
    );
    const { result } = renderHook(() => useResumeViewUrl("r-1"), { wrapper });
    await waitFor(() =>
      expect(result.current.data?.url).toBe("https://files/cv.pdf")
    );
  });
});

describe("resume mutations", () => {
  const put =
    (endpoint: string, method: "post" | "patch" | "delete") =>
    (seen: string[]) => {
      const handler = http[method](`${API}${endpoint}`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope(null);
      });
      server.use(handler);
    };

  it("creates a resume", async () => {
    const seen: string[] = [];
    put("/resume/create", "post")(seen);
    const { result } = renderHook(() => useCreateResume(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({} as never);
    });
    expect(seen).toEqual(["/api/v1/resume/create"]);
  });

  it("updates a resume", async () => {
    const seen: string[] = [];
    put("/resume/r-1", "patch")(seen);
    const { result } = renderHook(() => useUpdateResume(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "r-1", name: "CV" });
    });
    expect(seen).toEqual(["/api/v1/resume/r-1"]);
  });

  it("extracts a resume", async () => {
    const seen: string[] = [];
    put("/resume/r-1/extract", "post")(seen);
    const { result } = renderHook(() => useExtractResume(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: "r-1", provider: "google" });
    });
    expect(seen).toEqual(["/api/v1/resume/r-1/extract"]);
  });

  it("uploads a resume file", async () => {
    const seen: string[] = [];
    server.use(
      http.post(`${API}/resume`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope({ success: true });
      })
    );
    const { result } = renderHook(() => useUploadResume(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        file: "cv-bytes" as unknown as File,
        name: "My CV",
      });
    });
    expect(seen).toEqual(["/api/v1/resume"]);
  });

  it("deletes a resume", async () => {
    const seen: string[] = [];
    put("/resume/r-1", "delete")(seen);
    const { result } = renderHook(() => useDeleteResume(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("r-1");
    });
    expect(seen).toEqual(["/api/v1/resume/r-1"]);
  });

  it("sets the primary resume", async () => {
    const seen: string[] = [];
    put("/resume/r-1/primary", "patch")(seen);
    const { result } = renderHook(() => useSetPrimaryResume(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync("r-1");
    });
    expect(seen).toEqual(["/api/v1/resume/r-1/primary"]);
  });
});
