import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import type { IResume, TAtsCategory } from "@/api/resumes";
import { ATSReview } from "@/components/resume/ats/ATSReview.tsx";
import {
  clearAtsScores,
  getDb,
  type IAtsCacheEntry,
  SCORES_STORE,
} from "@/lib/indexdb";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const CREATED_AT = "2026-01-01T00:00:00.000Z";

const PICK_PROMPT_PATTERN = /Pick a job and resume/;
const SAVED_CARD_PATTERN = /Main resume/;
const FILTERED_EMPTY_PATTERN = /No saved scores for this selection yet/;

const envelope = <T,>(data: T) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const job: IJob = {
  companyId: 11,
  companyName: "Acme",
  createdAt: CREATED_AT,
  description: "Senior role",
  id: "job-1",
  status: "saved",
  title: "Staff Engineer",
  updatedAt: CREATED_AT,
};

const resume: IResume = {
  content: null,
  createdAt: CREATED_AT,
  id: "res-1",
  isPrimary: true,
  isPublic: false,
  name: "Main resume",
  profileId: "profile-1",
  slug: null,
  template: null,
  updatedAt: CREATED_AT,
  url: null,
};

const categories: TAtsCategory[] = [
  { key: "skillsMatch", score: 80, tips: [] },
  { key: "keywordHitRate", score: 70, tips: [] },
  { key: "experienceFit", score: 75, tips: [] },
  { key: "roleAlignment", score: 65, tips: [] },
];

const makeEntry = (
  overrides: Partial<IAtsCacheEntry> = {}
): IAtsCacheEntry => ({
  categories,
  jobId: "job-1",
  matchedKeywords: ["React"],
  missingKeywords: ["GraphQL"],
  overall: 82,
  recommendations: ["Add metrics"],
  resumeId: "res-1",
  tailoringNotes: "Tailor to fintech",
  timestamp: 1,
  ...overrides,
});

const seed = async (entry: IAtsCacheEntry): Promise<void> => {
  const db = await getDb();
  await db.put(SCORES_STORE, entry, `${entry.jobId}|${entry.resumeId}`);
};

describe("ATSReview", () => {
  beforeEach(async () => {
    await clearAtsScores();
    server.use(
      http.get("*/api/v1/jobs", () => envelope([job])),
      http.get("*/api/v1/resume", () => envelope([resume]))
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("prompts for a job and resume when nothing is saved", async () => {
    const view = render(<ATSReview />);
    expect(await view.findByText("Resume Review")).toBeInTheDocument();
    expect(screen.getByText(PICK_PROMPT_PATTERN)).toBeInTheDocument();
  });

  it("renders a saved review with resume, job context and score", async () => {
    await seed(makeEntry());
    const view = render(<ATSReview job={job} />);

    expect(await view.findByText("Main resume")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer @ Acme")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();

    await view.user.click(
      screen.getByRole("button", { name: SAVED_CARD_PATTERN })
    );

    expect(await screen.findByText("Skills Match")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Add metrics")).toBeInTheDocument();
    expect(screen.getByText("Tailor to fintech")).toBeInTheDocument();
  });

  it("shows at most five recent reviews by default", async () => {
    await Promise.all(
      Array.from({ length: 6 }, (_, index) =>
        seed(makeEntry({ jobId: `job-${index}`, timestamp: index }))
      )
    );
    const view = render(<ATSReview />);
    expect(await view.findAllByText("Main resume")).toHaveLength(5);
  });

  it("shows the filtered empty state when no owned resume matches", async () => {
    await seed(makeEntry({ resumeId: "res-ghost" }));
    const view = render(<ATSReview job={job} />);
    expect(await view.findByText("Resume Review")).toBeInTheDocument();
    expect(await screen.findByText(FILTERED_EMPTY_PATTERN)).toBeInTheDocument();
  });

  it("filters by the selected job and resume", async () => {
    const view = render(<ATSReview />);

    await view.user.click((await screen.findAllByRole("combobox"))[0]);
    await view.user.click(
      await screen.findByRole("option", { name: "Staff Engineer @ Acme" })
    );

    await view.user.click(screen.getAllByRole("combobox")[1]);
    await view.user.click(
      await screen.findByRole("option", { name: "Main resume" })
    );

    expect(await screen.findByText(FILTERED_EMPTY_PATTERN)).toBeInTheDocument();
  });

  it("falls back to the job prop when the job list lacks it", async () => {
    server.use(http.get("*/api/v1/jobs", () => envelope([])));
    await seed(makeEntry());
    const view = render(<ATSReview job={job} />);

    await view.user.click((await screen.findAllByRole("combobox"))[0]);
    await view.user.click(
      await screen.findByRole("option", { name: "Main resume" })
    );

    expect(await view.findByText("Main resume")).toBeInTheDocument();
  });

  it("ignores saved entries whose resume is unknown", async () => {
    await seed(makeEntry({ resumeId: "res-unknown" }));
    const view = render(<ATSReview />);
    expect(await view.findByText(PICK_PROMPT_PATTERN)).toBeInTheDocument();
    expect(screen.queryByText(SAVED_CARD_PATTERN)).not.toBeInTheDocument();
  });
});
