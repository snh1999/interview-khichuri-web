import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { useGenerateProject } from "@/api/portfolio/index.ts";
import { server } from "@/test/msw/server.ts";

const app = "export default function App() { return null; }";

describe("useGenerateProject", () => {
  it("streams files through the callback and resolves the finish result", async () => {
    const onFiles = vi.fn();
    const { result } = renderHook(() => useGenerateProject(onFiles));

    let response: Awaited<ReturnType<typeof result.current.run>>;
    await act(async () => {
      response = await result.current.run({
        prompt: "studio",
        provider: "google",
      });
    });

    expect(onFiles).toHaveBeenCalledWith({ "/App.js": app });
    expect(response).toEqual({
      files: { "/App.js": app },
      message: "Generated 1 file",
      applied: [],
      failed: [],
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.plan).toEqual([
      { path: "/App.js", description: "Root" },
    ]);
    expect(result.current.completed).toEqual(["/App.js"]);
  });

  it("surfaces the failed paths from the finish chunk", async () => {
    server.use(
      http.post(
        "*/api/v1/portfolio/generate",
        () =>
          new HttpResponse(
            `data: ${JSON.stringify({
              type: "finish",
              files: { "/App.js": app },
              message: "Generated 1 file. Could not generate: /Hero.jsx.",
              failed: ["/Hero.jsx"],
            })}\n\n`,
            { headers: { "Content-Type": "text/event-stream" } }
          )
      )
    );

    const { result } = renderHook(() => useGenerateProject(vi.fn()));

    let response: Awaited<ReturnType<typeof result.current.run>>;
    await act(async () => {
      response = await result.current.run({
        prompt: "studio",
        provider: "google",
      });
    });

    expect(response?.failed).toEqual(["/Hero.jsx"]);
  });

  it("rejects when the stream emits an error chunk", async () => {
    server.use(
      http.post(
        "*/api/v1/portfolio/generate",
        () =>
          new HttpResponse(
            `data: ${JSON.stringify({ type: "error", message: "quota exceeded" })}\n\n`,
            { headers: { "Content-Type": "text/event-stream" } }
          )
      )
    );

    const { result } = renderHook(() => useGenerateProject(vi.fn()));

    await expect(
      act(async () => {
        await result.current.run({ prompt: "studio", provider: "google" });
      })
    ).rejects.toThrow("quota exceeded");

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});
