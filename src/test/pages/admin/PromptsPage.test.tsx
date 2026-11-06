import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { IPrompt } from "@/api/prompts";
import { PromptsPage } from "@/pages/admin/PromptsPage.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";
const YEAR_PATTERN = /2026/u;
const TITLE_PATTERN = /Outage retrospective/u;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const prompt: IPrompt = {
  createdAt: "2026-06-15T12:00:00.000Z",
  id: 4,
  isPublic: true,
  likeCount: 3,
  prompt: "Ask the candidate about a recent outage they debugged.",
  title: "Outage retrospective",
  type: "behavioral",
  updatedAt: "2026-06-15T12:00:00.000Z",
  userId: "user-1",
};

const servePrompts = () => {
  const requests: URL[] = [];
  const deleted: string[] = [];
  server.use(
    http.get(`${API}/prompts`, ({ request }) => {
      requests.push(new URL(request.url));
      return envelope([prompt]);
    }),
    http.delete(`${API}/prompts/admin/:id`, ({ params }) => {
      deleted.push(String(params.id));
      return new HttpResponse(null, { status: 204 });
    })
  );
  return {
    deleted,
    lastRequest: () => requests.at(-1),
  };
};

describe("PromptsPage", () => {
  it("renders prompts with type, scope, owner and created columns", async () => {
    servePrompts();

    render(<PromptsPage />, { route: "/admin/prompts" });

    expect(await screen.findByText("Outage retrospective")).toBeInTheDocument();
    expect(screen.getByText("Behavioral")).toBeInTheDocument();
    expect(screen.getAllByText("Public").length).toBeGreaterThan(0);
    expect(screen.getByText("user-1")).toBeInTheDocument();
    expect(screen.getAllByText(YEAR_PATTERN).length).toBeGreaterThan(0);
  });

  it("sends search to the server", async () => {
    const { lastRequest } = servePrompts();

    const { user } = render(<PromptsPage />, { route: "/admin/prompts" });
    await screen.findByText("Outage retrospective");

    await user.type(screen.getByPlaceholderText("Search prompts"), "outage");

    await waitFor(() => {
      expect(lastRequest()?.searchParams.get("search")).toBe("outage");
    });
    expect(lastRequest()?.searchParams.get("scope")).toBe("public");
    expect(lastRequest()?.searchParams.get("page")).toBe("1");
  });

  it("deletes a prompt only after confirmation", async () => {
    const { deleted } = servePrompts();

    const { user } = render(<PromptsPage />, { route: "/admin/prompts" });
    await screen.findByText("Outage retrospective");

    await user.click(screen.getByLabelText("Delete prompt"));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(TITLE_PATTERN)).toBeInTheDocument();
    expect(deleted).toHaveLength(0);

    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleted).toEqual(["4"]);
    });
  });
});
