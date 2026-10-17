import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useMemo } from "react";
import { describe, expect, it } from "vitest";
import { useGenerateBuilder } from "@/api/portfolio/index.ts";

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
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("useGenerateBuilder", () => {
  it("posts the project and returns the files, message and applied list", async () => {
    const { result } = renderHook(() => useGenerateBuilder(), { wrapper });

    let response: Awaited<ReturnType<typeof result.current.mutateAsync>>;
    await act(async () => {
      response = await result.current.mutateAsync({
        prompt: "Add a hero",
        files: { "/App.js": "export default () => null;" },
        manifest: [],
        provider: "google",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(response).toEqual({
      files: { "/App.js": "export default () => null;" },
      message: "Mocked builder reply",
      applied: [],
    });
  });
});
