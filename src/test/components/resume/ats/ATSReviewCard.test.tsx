import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TAtsScore } from "@/api/resumes";
import { ATSReviewCard } from "@/components/resume/ats/ATSReviewCard.tsx";
import { render } from "@/test/render.tsx";

const GAPS_PATTERN = /gaps/u;
const RESUME_BUTTON_PATTERN = /resume/u;

const score: TAtsScore = {
  categories: [
    { key: "skillsMatch", score: 80, tips: [] },
    { key: "keywordHitRate", score: 70, tips: [] },
  ],
  matchedKeywords: ["React", "TypeScript"],
  missingKeywords: ["GraphQL"],
  overall: 82,
  recommendations: ["Add metrics to your impact bullets"],
  tailoringNotes: "Tailor the summary to fintech.",
};

const openCard = async (user: ReturnType<typeof render>["user"]) => {
  await user.click(screen.getByRole("button", { name: RESUME_BUTTON_PATTERN }));
};

describe("ATSReviewCard", () => {
  it("shows context, keyword gaps, recommendations and tailoring", async () => {
    const { user } = render(
      <ATSReviewCard
        companyName="Acme"
        isCached={false}
        jobTitle="Staff Engineer"
        onRegenerate={vi.fn()}
        resumeName="Main resume"
        score={score}
      />
    );
    await openCard(user);

    expect(screen.getByText("Staff Engineer @ Acme")).toBeInTheDocument();
    expect(screen.getByText("Skills Match")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("GraphQL")).toBeInTheDocument();
    expect(screen.getByText("1 gaps")).toBeInTheDocument();
    expect(
      screen.getByText("Add metrics to your impact bullets")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tailor the summary to fintech.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cached locally — results not stored on the server.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Regenerate" })
    ).toBeInTheDocument();
  });

  it("handles an empty score and no regenerate action", async () => {
    const { user } = render(
      <ATSReviewCard
        score={{
          ...score,
          categories: [],
          matchedKeywords: [],
          missingKeywords: [],
          recommendations: [],
          tailoringNotes: "",
        }}
      />
    );
    await openCard(user);

    expect(screen.getByText("Unnamed resume")).toBeInTheDocument();
    expect(screen.getByText("No matched keywords")).toBeInTheDocument();
    expect(screen.queryByText(GAPS_PATTERN)).not.toBeInTheDocument();
    expect(screen.queryByText("Company Tailoring")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Regenerate" })
    ).not.toBeInTheDocument();
  });

  it("marks cached results and a running regeneration", async () => {
    const { user } = render(
      <ATSReviewCard
        isCached
        isRegenerating
        onRegenerate={vi.fn()}
        resumeName="Main resume"
        score={score}
      />
    );
    await openCard(user);

    expect(
      screen.getByText("Showing cached summary — regenerate for full details.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Regenerating..." })
    ).toBeDisabled();
  });
});
