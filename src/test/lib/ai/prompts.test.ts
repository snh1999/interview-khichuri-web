import { describe, expect, it } from "vitest";
import {
  atsScoreCopyPrompt,
  generateQuestionsCopyPrompt,
  interviewEvaluationCopyPrompt,
  standaloneReviewCopyPrompt,
} from "@/lib/ai/prompts.ts";

describe("atsScoreCopyPrompt", () => {
  it("falls back to placeholder job and resume text", () => {
    const output = atsScoreCopyPrompt({});
    expect(output).toContain("## Job\n");
    expect(output).toContain("(not provided)");
    expect(output).toContain("No resume text is available");
    expect(output).toContain("skillsMatch");
  });

  it("inlines the job header, description and resume", () => {
    const output = atsScoreCopyPrompt({
      companyName: "Acme",
      jobDescription: "React role",
      jobTitle: "Frontend",
      resumeText: "Shipped things",
    });
    expect(output).toContain("## Job: Frontend at Acme");
    expect(output).toContain("React role");
    expect(output).toContain("<resume_text>\nShipped things\n</resume_text>");
  });
});

describe("standaloneReviewCopyPrompt", () => {
  it("prompts for a resume when none is provided", () => {
    expect(standaloneReviewCopyPrompt({})).toContain(
      "No resume text is available"
    );
  });

  it("embeds the supplied resume", () => {
    expect(standaloneReviewCopyPrompt({ resumeText: "Built APIs" })).toContain(
      "Built APIs"
    );
  });
});

describe("generateQuestionsCopyPrompt", () => {
  it("uses defaults and omits the job block", () => {
    const output = generateQuestionsCopyPrompt({});
    expect(output).toContain("A set of interview questions.");
    expect(output).toContain(
      "- Cover a spread of topics rather than piling onto one."
    );
    expect(output).toContain("(not provided)");
    expect(output).not.toContain("## Job description");
  });

  it("counts questions, lists topics and adds the job description", () => {
    const output = generateQuestionsCopyPrompt({
      count: 5,
      description: "Interviewing for a platform team",
      experience: "senior",
      includeJobDescription: true,
      jobDescription: "Kubernetes",
      title: "SRE",
      topics: ["networking", "observability"],
    });
    expect(output).toContain("5 interview questions.");
    expect(output).toContain("- networking\n- observability");
    expect(output).toContain("Target role: SRE");
    expect(output).toContain("Experience level: senior");
    expect(output).toContain("## Job description");
    expect(output).toContain("Kubernetes");
  });
});

describe("interviewEvaluationCopyPrompt", () => {
  it("falls back to not provided with no transcript", () => {
    expect(interviewEvaluationCopyPrompt({})).toContain("(not provided)");
  });

  it("renders answers and marks blank ones", () => {
    const output = interviewEvaluationCopyPrompt({
      transcript: [
        { answer: "I would use a queue", question: "How do you scale?" },
        { answer: "   ", question: "Tell me about yourself" },
      ],
    });
    expect(output).toContain("### How do you scale?");
    expect(output).toContain("I would use a queue");
    expect(output).toContain("(no answer)");
  });
});
