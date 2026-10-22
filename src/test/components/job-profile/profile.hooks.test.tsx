import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { type ReactNode, Suspense, useMemo } from "react";
import { describe, expect, it } from "vitest";
import { getUseJobProfileForm } from "@/components/job-profile/profile.hooks.ts";
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

const renderProfileForm = async () => {
  const view = renderHook(() => getUseJobProfileForm(), { wrapper });
  await waitFor(() =>
    expect(view.result.current.form.formState.isReady).toBe(true)
  );
  return view;
};

describe("getUseJobProfileForm", () => {
  it("keeps failed sections dirty and retries only them", async () => {
    const calls: string[] = [];
    server.use(
      http.get(`${API}/lookups/topics`, () => envelope([])),
      http.get(`${API}/lookups/industries`, () => envelope([])),
      http.put(`${API}/profile`, () => {
        calls.push("personal");
        return HttpResponse.json(
          { message: "Database unavailable", statusCode: 500 },
          { status: 500 }
        );
      }),
      http.put(`${API}/profile/work-experience`, () => {
        calls.push("workExperience");
        return envelope(null);
      })
    );

    const { result } = await renderProfileForm();

    act(() => {
      result.current.form.setValue("personal.firstName", "Grace", {
        shouldDirty: true,
      });
      result.current.form.setValue(
        "workExperience",
        [
          {
            company: "Acme",
            isCurrent: false,
            startDate: new Date("2025-01-01"),
            title: "Engineer",
          },
        ],
        { shouldDirty: true }
      );
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(result.current.form.formState.dirtyFields.personal).toBeTruthy();
    expect(
      Object.keys(
        result.current.form.formState.dirtyFields.workExperience ?? {}
      )
    ).toHaveLength(0);
    expect(result.current.form.getValues("personal.firstName")).toBe("Grace");

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(calls).toEqual(["personal", "workExperience", "personal"]);
  });

  it("resolves known lookup names and drops unknown ones", async () => {
    let overviewBody: unknown = null;
    server.use(
      http.get(`${API}/lookups/topics`, () =>
        envelope([{ id: 42, isApproved: true, name: "Rust" }])
      ),
      http.get(`${API}/lookups/industries`, () => envelope([])),
      http.put(`${API}/profile/work-overview`, async ({ request }) => {
        overviewBody = await request.json();
        return envelope(null);
      })
    );

    const { result } = await renderProfileForm();

    act(() => {
      result.current.form.setValue(
        "professional.skillNames",
        ["Rust", "Unknown Skill"],
        { shouldDirty: true }
      );
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(overviewBody).toMatchObject({
      skillNames: [],
      skills: [42],
    });
  });
});
