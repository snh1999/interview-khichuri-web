import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import type { IPrompt } from "@/api/prompts";
import { PromptFormDialog } from "@/components/prompts/PromptFormDialog.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const DESCRIPTION =
  "Describe how you would design a rate limiter for a distributed API.";

const editPrompt: IPrompt = {
  createdAt: new Date("2026-01-01").toISOString(),
  id: 7,
  isPublic: true,
  likeCount: 3,
  prompt: DESCRIPTION,
  title: "Rate limiter design",
  type: "system_design",
  updatedAt: new Date("2026-01-01").toISOString(),
  userId: "user-1",
};

const validationResponse = () => ({
  data: { shape: { pass: true, errors: [] }, llmJudge: null },
  message: "OK",
  statusCode: 200,
});

const passValidation = () =>
  http.post("*/api/v1/prompts/validate", async () =>
    HttpResponse.json(validationResponse())
  );

const selectType = async (
  user: ReturnType<typeof render>["user"],
  label: string
) => {
  await user.click(screen.getByRole("combobox", { name: "Type" }));
  await user.click(await screen.findByRole("option", { name: label }));
};

const fillPrompt = async (
  user: ReturnType<typeof render>["user"],
  title: string
) => {
  await user.type(screen.getByLabelText("Title"), title);
  await user.type(screen.getByLabelText("Prompt"), DESCRIPTION);
};

describe("PromptFormDialog", () => {
  const onOpenChange = vi.fn();

  it("shows validation errors when submitted empty", async () => {
    const { user } = render(
      <PromptFormDialog onOpenChange={onOpenChange} open />
    );

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(
      screen.getByText("Minimum allowed prompt size is 20")
    ).toBeInTheDocument();
    expect(screen.getByText("Please select a type")).toBeInTheDocument();
  });

  it("blocks the save before validation when no AI key is active", async () => {
    let sentToValidation: unknown = null;
    server.use(
      http.get("*/api/v1/ai/api-keys*", () =>
        HttpResponse.json({ data: [], message: "OK", statusCode: 200 })
      ),
      http.post("*/api/v1/prompts/validate", async ({ request }) => {
        sentToValidation = await request.json();
        return HttpResponse.json(validationResponse());
      })
    );
    const { user } = render(
      <PromptFormDialog onOpenChange={onOpenChange} open />
    );

    await selectType(user, "Technical");
    await fillPrompt(user, "Rate limiter");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText(
        "Add an API key in Settings to enable AI validation for this prompt type"
      )
    ).toBeInTheDocument();
    expect(sentToValidation).toBeNull();
  });

  it("creates a prompt after validation passes", async () => {
    let postedPrompt: unknown = null;
    server.use(
      passValidation(),
      http.post("*/api/v1/prompts", async ({ request }) => {
        postedPrompt = await request.json();
        return HttpResponse.json(
          {
            data: {
              ...(postedPrompt as object),
              createdAt: new Date().toISOString(),
              id: 9,
              likeCount: 0,
              updatedAt: new Date().toISOString(),
              userId: "user-1",
            },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    onOpenChange.mockClear();
    const { user } = render(
      <>
        <PromptFormDialog onOpenChange={onOpenChange} open />
        <Toaster />
      </>
    );

    await selectType(user, "Technical");
    await fillPrompt(user, "Rate limiter");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(postedPrompt).toMatchObject({
        title: "Rate limiter",
        prompt: DESCRIPTION,
        type: "technical",
        isPublic: false,
      });
    });
    expect(await screen.findByText("Prompt created")).toBeInTheDocument();
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("updates an existing prompt through PATCH", async () => {
    let patchedPrompt: unknown = null;
    const newTitle = "Designing a distributed rate limiter";
    server.use(
      passValidation(),
      http.patch("*/api/v1/prompts/7", async ({ request }) => {
        patchedPrompt = await request.json();
        return HttpResponse.json({ ...editPrompt, title: newTitle });
      })
    );
    onOpenChange.mockClear();
    const { user } = render(
      <>
        <PromptFormDialog
          onOpenChange={onOpenChange}
          open
          prompt={editPrompt}
        />
        <Toaster />
      </>
    );

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), newTitle);
    await user.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(patchedPrompt).toMatchObject({
        title: newTitle,
        prompt: DESCRIPTION,
        type: "system_design",
        isPublic: true,
      });
    });
    expect(await screen.findByText("Prompt updated")).toBeInTheDocument();
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
