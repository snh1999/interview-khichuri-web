import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw/http";
import { describe, expect, it } from "vitest";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const openDialog = async (user: ReturnType<typeof render>["user"]) => {
  await user.click(screen.getByRole("button", { name: "Send feedback" }));
  await screen.findByLabelText("Message");
};

describe("FeedbackDialog", () => {
  it("requires a message before submitting", async () => {
    const { user } = render(<FeedbackDialog />);

    await openDialog(user);
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("Must be at least 10 characters long")
    ).toBeInTheDocument();
  });

  it("clears a discarded draft when reopened", async () => {
    const { user } = render(<FeedbackDialog />);

    await openDialog(user);
    await user.type(screen.getByLabelText("Message"), "Discarded draft");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(await screen.findByRole("button", { name: "Discard" }));

    await openDialog(user);

    expect(screen.getByLabelText("Message")).toHaveValue("");
  });

  it("posts the selected type, message and current route, then closes", async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post("*/api/v1/feedback", async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            data: { ...captured, id: "feedback-1" },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user } = render(<FeedbackDialog />, { route: "/jobs/123" });

    await openDialog(user);
    await user.click(screen.getByRole("combobox", { name: "Type" }));
    await user.click(
      await screen.findByRole("option", { name: "General feedback" })
    );
    await user.type(screen.getByLabelText("Message"), "Loving the dashboard");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(captured).toMatchObject({
        message: "Loving the dashboard",
        route: "/jobs/123",
        type: "feedback",
      });
    });
    await waitFor(() => {
      expect(screen.queryByLabelText("Message")).not.toBeInTheDocument();
    });
  });

  it("hides the type and posts a prefilled company request", async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.post("*/api/v1/feedback", async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            data: { ...captured, id: "feedback-2" },
            message: "Created",
            statusCode: 201,
          },
          { status: 201 }
        );
      })
    );
    const { user } = render(
      <FeedbackDialog
        hideType
        initialMessage="Company name: Acme"
        initialType="company_request"
      />,
      { route: "/companies" }
    );

    await openDialog(user);

    expect(
      screen.queryByRole("combobox", { name: "Type" })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toHaveValue("Company name: Acme");

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(captured).toMatchObject({
        message: "Company name: Acme",
        route: "/companies",
        type: "company_request",
      });
    });
  });
});
