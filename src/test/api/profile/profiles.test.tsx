import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode, Suspense, useMemo } from "react";
import { describe, expect, it } from "vitest";
import {
  useProfile,
  useUpdateActivities,
  useUpdateEducation,
  useUpdateLinks,
  useUpdatePreferences,
  useUpdateProfile,
  useUpdateProjects,
  useUpdatePublications,
  useUpdateReferences,
  useUpdateWorkExperience,
  useUpdateWorkOverview,
} from "@/api/profile/profiles.ts";
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

const MUTATIONS = [
  { dto: {}, hook: useUpdateProfile, path: "/profile" },
  { dto: {}, hook: useUpdateWorkOverview, path: "/profile/work-overview" },
  { dto: {}, hook: useUpdateWorkExperience, path: "/profile/work-experience" },
  { dto: {}, hook: useUpdateEducation, path: "/profile/education" },
  { dto: {}, hook: useUpdatePreferences, path: "/profile/preferences" },
  { dto: {}, hook: useUpdateLinks, path: "/profile/links" },
  { dto: {}, hook: useUpdatePublications, path: "/profile/publications" },
  { dto: {}, hook: useUpdateProjects, path: "/profile/projects" },
  { dto: {}, hook: useUpdateReferences, path: "/profile/references" },
  { dto: {}, hook: useUpdateActivities, path: "/profile/activities" },
];

describe("useProfile", () => {
  it("loads the profile", async () => {
    server.use(
      http.get(`${API}/profile`, () =>
        envelope({ firstName: "Ada", id: "p-1" })
      )
    );

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.firstName).toBe("Ada");
  });
});

describe.each(MUTATIONS)("$path", ({ dto, hook, path }) => {
  it("sends the mutation to the expected endpoint", async () => {
    const seen: string[] = [];
    server.use(
      http.put(`${API}${path}`, ({ request }) => {
        seen.push(new URL(request.url).pathname);
        return envelope(null);
      })
    );

    const { result } = renderHook(() => hook(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync(dto as never);
    });

    expect(seen).toEqual([`/api/v1${path}`]);
  });
});
