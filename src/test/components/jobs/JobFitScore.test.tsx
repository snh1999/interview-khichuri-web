import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import { JobFitScore } from "@/components/jobs/JobFitScore.tsx";
import { server } from "@/test/msw/server.ts";
import { render } from "@/test/render.tsx";

const API = "*/api/v1";

const NO_PROFILE_DATA = /Not enough profile\/job data to score/;

const envelope = (data: unknown) =>
  HttpResponse.json({ data, message: "OK", statusCode: 200 });

const job: IJob = {
  companyName: "Acme",
  createdAt: "2024-01-01",
  description: "Senior React TypeScript engineer with GraphQL experience",
  id: "job-1",
  status: "saved",
  title: "Senior Engineer",
  topicIds: [1],
  updatedAt: "2024-01-01",
};

const profile = {
  jobPreferences: [],
  workExperiences: [],
  workOverviews: [
    {
      experienceLevel: "senior",
      id: 1,
      industries: [],
      profileId: "p1",
      skills: [{ id: 1, topicId: 1, workId: 1 }],
      title: "Engineer",
    },
  ],
};

const handlers = (profileData: unknown) => [
  http.get(`${API}/profile`, () => envelope(profileData)),
  http.get(`${API}/lookups/topics`, () =>
    envelope([{ id: 1, isApproved: true, name: "React" }])
  ),
];

describe("JobFitScore", () => {
  it("scores profile fit against the job's skill tags", async () => {
    server.use(...handlers(profile));
    render(<JobFitScore job={job} />);

    expect(await screen.findByText("Profile fit")).toBeInTheDocument();
    // skills 100 + seniority 100, salary bonus forfeited -> 95
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.queryByText(NO_PROFILE_DATA)).not.toBeInTheDocument();
  });

  it("shows a message when there is no profile data", async () => {
    server.use(
      ...handlers({
        jobPreferences: [],
        workExperiences: [],
        workOverviews: [],
      })
    );
    render(<JobFitScore job={job} />);

    expect(await screen.findByText("Profile fit")).toBeInTheDocument();
    expect(screen.getByText(NO_PROFILE_DATA)).toBeInTheDocument();
  });
});
