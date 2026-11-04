import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { Link, Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AiActionButton } from "@/components/common/ai/AiActionButton.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { useAppStore } from "@/store/appStore.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const apiKey = {
  createdAt: "2024-01-01",
  id: "k-1",
  isActive: true,
  name: "OpenAI",
  provider: "openai",
  updatedAt: "2024-01-01",
  userId: "u-1",
};

const withProvider = (provider = "openai") =>
  server.use(
    http.get(`${API}/ai/api-keys`, () => envelope([{ ...apiKey, provider }]))
  );

afterEach(() => {
  useAppStore.setState({ skipAiDialog: false });
});

const LocationProbe = () => {
  const location = useLocation();
  return <span>{location.pathname}</span>;
};

describe("AiActionButton", () => {
  it("opens the dialog and executes with the selected provider", async () => {
    withProvider();
    const execute = vi.fn();
    const { user } = render(
      <AiActionButton execute={execute} executeLabel="Summarize" title="AI" />
    );

    await user.click(await screen.findByRole("button", { name: "Summarize" }));
    await screen.findByText("AI");

    const buttons = screen.getAllByRole("button", { name: "Summarize" });
    await user.click(buttons.at(-1) as HTMLElement);

    await waitFor(() =>
      expect(execute).toHaveBeenCalledWith("openai", undefined, undefined)
    );
  });

  it("runs immediately with the default provider when the dialog is skipped", async () => {
    withProvider();
    useAppStore.setState({ skipAiDialog: true });
    const execute = vi.fn();
    const { user } = render(
      <AiActionButton execute={execute} executeLabel="Summarize" title="AI" />
    );

    await user.click(await screen.findByRole("button", { name: "Summarize" }));

    await waitFor(() =>
      expect(execute).toHaveBeenCalledWith("openai", undefined, undefined)
    );
  });

  it("prompts for an API key when none are configured", async () => {
    server.use(http.get(`${API}/ai/api-keys`, () => envelope([])));
    const { user } = render(
      <AiActionButton execute={vi.fn()} executeLabel="Summarize" title="AI" />
    );

    await user.click(await screen.findByRole("button", { name: "Summarize" }));

    expect(
      await screen.findByText("No AI providers available.")
    ).toBeInTheDocument();
  });

  it("brings the user back to the page the AI call was made from", async () => {
    withProvider();
    useAppStore.setState({ skipAiDialog: true });
    let resolveExecute: (() => void) | undefined;
    const execute = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveExecute = resolve;
        })
    );
    const { user } = render(
      <>
        <Toaster duration={10_000} />
        <Link to="/jobs/456">Elsewhere</Link>
        <Routes>
          <Route
            element={
              <AiActionButton
                execute={execute}
                executeLabel="Summarize"
                title="AI"
              />
            }
            path="/jobs/123"
          />
          <Route element={<span>elsewhere</span>} path="/jobs/456" />
        </Routes>
        <LocationProbe />
      </>,
      { route: "/jobs/123" }
    );

    await user.click(await screen.findByRole("button", { name: "Summarize" }));
    await user.click(screen.getByRole("link", { name: "Elsewhere" }));

    expect(screen.getByText("/jobs/456")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Summarize" })
    ).not.toBeInTheDocument();

    if (resolveExecute) {
      resolveExecute();
    }
    await user.click(await screen.findByRole("button", { name: "View" }));

    expect(await screen.findByText("/jobs/123")).toBeInTheDocument();
  });
});
