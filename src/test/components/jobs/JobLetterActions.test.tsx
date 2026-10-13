import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import { JobLetterActions } from "@/components/jobs/JobLetterActions.tsx";
import { useAppStore } from "@/store/appStore.ts";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const job: IJob = {
  companyName: "Acme",
  createdAt: "2024-01-01",
  description: "A job description.",
  id: "job-1",
  status: "saved",
  title: "Engineer",
  updatedAt: "2024-01-01",
};

const apiKey = {
  createdAt: "2024-01-01",
  id: "k-1",
  isActive: true,
  name: "OpenAI",
  provider: "openai",
  updatedAt: "2024-01-01",
  userId: "u-1",
};

const lettersHandlers = (markdown: string, path: string) => [
  http.get(`${API}/ai/api-keys`, () => envelope([apiKey])),
  http.get(`${API}/resume`, () => envelope([])),
  http.post(`${API}${path}`, () => envelope({ markdown })),
];

afterEach(() => {
  useAppStore.setState({ skipAiDialog: false });
});

describe("JobLetterActions", () => {
  it("drafts and shows a cover letter in the result drawlog", async () => {
    server.use(
      ...lettersHandlers(
        "# A tailored cover letter\n\nFor Acme.",
        "/jobs/job-1/cover-letter"
      )
    );
    const { user } = render(<JobLetterActions job={job} />);

    await user.click(await screen.findByRole("button", { name: "Generate" }));
    await user.click(
      await screen.findByRole("button", { name: "Cover Letter" })
    );
    const dialogButtons = screen.getAllByRole("button", {
      name: "Cover Letter",
    });
    await user.click(dialogButtons.at(-1) as HTMLElement);

    expect(
      await screen.findByText("A tailored cover letter")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy Cover Letter" })
    ).toBeInTheDocument();
  });

  it("drafts and shows an outreach email in the result drawlog", async () => {
    server.use(
      ...lettersHandlers("# Reach out\n\nHi there,", "/jobs/job-1/outreach")
    );
    const { user } = render(<JobLetterActions job={job} />);

    await user.click(await screen.findByRole("button", { name: "Generate" }));
    await user.click(await screen.findByRole("button", { name: "Outreach" }));
    const dialogButtons = screen.getAllByRole("button", { name: "Outreach" });
    await user.click(dialogButtons.at(-1) as HTMLElement);

    expect(await screen.findByText("Reach out")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy Outreach Email" })
    ).toBeInTheDocument();
  });

  it("drafts and shows a linkedin dm in the result drawlog", async () => {
    server.use(
      ...lettersHandlers(
        "# Quick hello\n\nHi there,",
        "/jobs/job-1/linkedin-dm"
      )
    );
    const { user } = render(<JobLetterActions job={job} />);

    await user.click(await screen.findByRole("button", { name: "Generate" }));
    await user.click(
      await screen.findByRole("button", { name: "LinkedIn DM" })
    );
    const dialogButtons = screen.getAllByRole("button", {
      name: "LinkedIn DM",
    });
    await user.click(dialogButtons.at(-1) as HTMLElement);

    expect(await screen.findByText("Quick hello")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy LinkedIn DM" })
    ).toBeInTheDocument();
  });

  it("closes the drawlog when the markdown runs out", async () => {
    server.use(...lettersHandlers("Some draft.", "/jobs/job-1/cover-letter"));
    const { user } = render(<JobLetterActions job={job} />);

    await user.click(await screen.findByRole("button", { name: "Generate" }));
    await user.click(
      await screen.findByRole("button", { name: "Cover Letter" })
    );
    const dialogButtons = screen.getAllByRole("button", {
      name: "Cover Letter",
    });
    await user.click(dialogButtons.at(-1) as HTMLElement);

    await screen.findByText("Some draft.");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
    );
  });
});
