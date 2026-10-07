import { describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import type { IPrepSession } from "@/api/sessions";
import { QUESTION_BANK } from "@/lib/questions/question-bank.ts";
import {
  createJobSearch,
  createQuestionBankSearch,
  createSearch,
  createSessionSearch,
} from "@/lib/search.ts";

interface IDoc {
  id: string;
  title: string;
  body: string;
}

const DOCS: IDoc[] = [
  { id: "1", title: "Senior Frontend Engineer", body: "react typescript" },
  { id: "2", title: "Backend Engineer", body: "go postgres" },
  { id: "3", title: "Frontend Designer", body: "css figma" },
];

const makeJob = (overrides: Partial<IJob>): IJob => ({
  id: "job-1",
  title: "Frontend Engineer",
  companyName: "Acme",
  description: "",
  status: "saved",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const makeSession = (overrides: Partial<IPrepSession>): IPrepSession => ({
  id: "session-1",
  title: "Mock interview",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("createSearch", () => {
  const search = () => createSearch(DOCS, ["title", "body"]);

  it("returns every document with a zero score for an empty query", () => {
    const results = search().search("   ");
    expect(results).toHaveLength(3);
    expect(results.map((result) => result.id)).toEqual(["1", "2", "3"]);
    for (const result of results) {
      expect(result.score).toBe(0);
      expect(result.terms).toEqual([]);
    }
  });

  it("matches prefixes by default", () => {
    const results = search().search("front");
    expect(results.map((result) => result.id).sort()).toEqual(["1", "3"]);
  });

  it("matches typos with the content preset but not with labels", () => {
    const content = createSearch(DOCS, ["title", "body"], {
      preset: "content",
    });
    const labels = createSearch(DOCS, ["title", "body"], {
      preset: "labels",
    });

    expect(content.search("engineerr").length).toBeGreaterThan(0);
    expect(labels.search("engineerr")).toHaveLength(0);
  });

  it("boosts weighted fields above unweighted ones", () => {
    const boosted = createSearch(
      [
        { id: "1", title: "Engineer", body: "acme" },
        { id: "2", title: "Designer", body: "nothing" },
      ],
      ["title", "body"],
      { weights: { title: 10 } }
    );

    const results = boosted.search("engineer acme");
    expect(results[0]?.id).toBe("1");
    expect(results[0]?.terms).toEqual(
      expect.arrayContaining(["engineer", "acme"])
    );
  });

  it("requires every term when combineWith is and", () => {
    const strict = createSearch(DOCS, ["title", "body"], {
      combineWith: "and",
    });

    expect(strict.search("senior frontend").map((r) => r.id)).toEqual(["1"]);
    expect(strict.search("senior backend")).toHaveLength(0);
  });

  it("honours the limit from options and per-call overrides", () => {
    const limited = createSearch(DOCS, ["title", "body"], { limit: 1 });

    expect(limited.search("")).toHaveLength(1);
    expect(limited.search("engineer")).toHaveLength(1);
    expect(limited.search("engineer", { limit: 5 })).toHaveLength(2);
  });
});

describe("search factories", () => {
  it("searches the question bank by its questions", () => {
    const [item] = QUESTION_BANK;
    const [firstQuestion = ""] = item?.questions ?? [];
    const [word = ""] = firstQuestion.split(" ");
    const results = createQuestionBankSearch().search(word.toLowerCase());

    expect(results.map((result) => result.id)).toContain(item?.id);
  });

  it("searches jobs by title and company name", () => {
    const search = createJobSearch([
      makeJob({ id: "job-1", title: "Frontend Engineer", companyName: "Acme" }),
      makeJob({ id: "job-2", title: "Designer", companyName: "Globex" }),
    ]);

    expect(search.search("frontend").map((r) => r.id)).toEqual(["job-1"]);
    expect(search.search("globex").map((r) => r.id)).toEqual(["job-2"]);
  });

  it("searches sessions by title, description, and resolved role", () => {
    const search = createSessionSearch(
      [
        makeSession({ id: "s-1", title: "System design round" }),
        makeSession({ id: "s-2", description: "salary negotiation practice" }),
        makeSession({ id: "s-3", roleId: 7 }),
      ],
      (roleId) => (roleId === 7 ? "Engineering Manager" : undefined)
    );

    expect(search.search("system design").map((r) => r.id)).toEqual(["s-1"]);
    expect(search.search("negotiation").map((r) => r.id)).toEqual(["s-2"]);
    expect(search.search("manager").map((r) => r.id)).toEqual(["s-3"]);
  });
});
