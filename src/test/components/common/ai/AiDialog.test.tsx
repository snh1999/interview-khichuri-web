import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { IApiKey } from "@/api/keys";
import { AiDialog } from "@/components/common/ai/AiDialog.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const PRIORITIES_RE = /Your priorities/;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const key = (provider: IApiKey["provider"]): IApiKey => ({
  createdAt: "",
  id: `k-${provider}`,
  isActive: true,
  model: "gpt-4",
  name: provider,
  provider,
  updatedAt: "",
  userId: null,
});

const withProviders = () =>
  server.use(http.get(`${API}/ai/api-keys`, () => envelope([key("openai")])));

const NO_PROVIDERS_RE = /No AI providers available/;
const DEFAULT_RE = /Runs on your default provider/;

describe("AiDialog", () => {
  it("prompts the user to add a key when none exist", async () => {
    server.use(http.get(`${API}/ai/api-keys`, () => envelope([])));
    render(
      <AiDialog
        onExecute={vi.fn()}
        onOpenChange={vi.fn()}
        open
        title="Ask AI"
      />
    );

    expect(await screen.findByText(NO_PROVIDERS_RE)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("runs on saved defaults without provider controls", async () => {
    withProviders();
    render(
      <AiDialog
        onExecute={vi.fn()}
        onOpenChange={vi.fn()}
        open
        title="Ask AI"
        useSavedDefaults
      />
    );

    expect(await screen.findByText(DEFAULT_RE)).toBeInTheDocument();
    expect(screen.queryByText("AI Provider")).not.toBeInTheDocument();
  });

  it("collects provider, model and instruction then executes", async () => {
    withProviders();
    const user = userEvent.setup();
    const onExecute = vi.fn();
    render(
      <AiDialog
        description="Explain this"
        onExecute={onExecute}
        onOpenChange={vi.fn()}
        open
        showInstruction
        title="Ask AI"
      />
    );

    expect(await screen.findByText("Ask AI")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("Name of specific model (optional)"),
      "gpt-4o"
    );
    await user.type(
      screen.getByPlaceholderText(PRIORITIES_RE),
      "Be concise"
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(onExecute).toHaveBeenCalledWith("openai", "gpt-4o", "Be concise")
    );
  });
});
