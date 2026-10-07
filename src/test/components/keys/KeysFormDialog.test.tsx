import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { KeysFormDialog } from "@/components/keys/KeysFormDialog.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

describe("KeysFormDialog", () => {
  it("shows validation errors when submitted empty", async () => {
    const { user } = render(<KeysFormDialog />);

    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("API key is required")).toBeInTheDocument();
  });

  it("posts the entered key and closes on success", async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post("*/api/v1/ai/api-keys", async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            data: {
              ...captured,
              createdAt: new Date().toISOString(),
              id: "key-new",
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
    const { user } = render(<KeysFormDialog />);

    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.type(screen.getByLabelText("Name"), "My Gemini key");
    await user.type(screen.getByLabelText("API key"), "secret-key");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(captured).toMatchObject({
        key: "secret-key",
        name: "My Gemini key",
        provider: "google",
      });
    });
    await waitFor(() => {
      expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    });
  });
});
