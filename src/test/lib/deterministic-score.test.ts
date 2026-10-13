import { describe, expect, it } from "vitest";
import type { IJob } from "@/api/jobs";
import type { TProfilePopulated } from "@/api/profile";
import {
  profileFacts,
  scoreJob,
  type TFacts,
} from "@/lib/deterministic-score.ts";

const job: IJob = {
  companyId: 1,
  companyName: "Acme",
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "Senior React TypeScript engineer with GraphQL experience",
  id: "j1",
  status: "saved",
  title: "Senior Software Engineer",
  topicIds: [1, 2],
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const profile = {
  id: "p1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  firstName: "A",
  lastName: "B",
  email: "a@b.com",
  workOverviews: [
    {
      id: 1,
      profileId: "p1",
      experienceLevel: "senior",
      title: "Engineer",
      skills: [
        { id: 1, workId: 1, topicId: 1, topic: { id: 1, name: "React" } },
        {
          id: 2,
          workId: 1,
          topicId: 2,
          topic: { id: 2, name: "TypeScript" },
        },
      ],
      industries: [],
    },
  ],
  workExperiences: [],
  jobPreferences: [
    {
      id: "pref-1",
      profileId: "p1",
      titles: [{ id: 1, preferenceId: "pref-1", roleId: 5 }],
    },
  ],
  educations: [],
  links: [],
  publications: [],
  projects: [],
  references: [],
  activities: [],
} as unknown as TProfilePopulated;

const baseFacts: TFacts = {
  roleIds: [],
  seniority: null,
  skillIds: [],
  workType: null,
};

const sectionScore = (
  score: ReturnType<typeof scoreJob>,
  key: string
): number | null => score.sections.find((s) => s.key === key)?.score ?? null;

const facts = () => profileFacts(profile);

describe("deterministic-score", () => {
  it("maps profile titles to role ids and overview skills to topic ids", () => {
    const pf = facts();
    expect(pf.roleIds).toEqual([5]);
    expect(pf.skillIds).toEqual([1, 2]);
    expect(pf.seniority).toBe("senior");
  });

  it("scores skill coverage of the job's topic ids", () => {
    const f = { ...baseFacts, skillIds: [1, 2] };
    expect(sectionScore(scoreJob(f, job), "skills")).toBe(100);
    // 2 of the job's 3 skills are held -> 67
    expect(
      sectionScore(scoreJob(f, { ...job, topicIds: [1, 2, 3] }), "skills")
    ).toBe(67);
    expect(
      sectionScore(scoreJob(f, { ...job, topicIds: [3, 4] }), "skills")
    ).toBe(0);
    // job states no tags -> no signal; candidate states no skills -> no signal
    expect(
      sectionScore(scoreJob(f, { ...job, topicIds: [] }), "skills")
    ).toBeNull();
    expect(sectionScore(scoreJob(baseFacts, job), "skills")).toBeNull();
  });

  it("ignores the description and reads only the job's topic ids", () => {
    const f = { ...baseFacts, skillIds: [1, 2] };
    const tagged = scoreJob(f, {
      ...job,
      description: "totally unrelated prose",
    });
    expect(sectionScore(tagged, "skills")).toBe(100);
    expect(
      sectionScore(scoreJob(f, { ...job, topicIds: [] }), "skills")
    ).toBeNull();
  });

  it("is deterministic on repeat", () => {
    const a = scoreJob(facts(), job);
    const b = scoreJob(facts(), job);
    expect(a.overall).toBe(b.overall);
    expect(a.grade).toBe(b.grade);
  });

  it("nulls dimensions and reports no signal for an empty profile", () => {
    const empty = profileFacts({
      ...profile,
      jobPreferences: [],
      workExperiences: [],
      workOverviews: [],
    } as unknown as TProfilePopulated);
    const s = scoreJob(empty, job);
    expect(sectionScore(s, "skills")).toBeNull();
    expect(sectionScore(s, "seniority")).toBeNull();
    expect(sectionScore(s, "workType")).toBeNull();
    expect(sectionScore(s, "location")).toBeNull();
    expect(sectionScore(s, "role")).toBeNull();
    expect(s.overall).toBe(0);
    expect(s.grade).toBe("F");
    expect(s.hasSignal).toBe(false);
  });

  it("shows a score once enough non-skill weight is present", () => {
    // a lone title match (seniority 25) clears 22, so list rows score
    const seniorityOnly = { ...baseFacts, seniority: "senior" as const };
    expect(scoreJob(seniorityOnly, job).hasSignal).toBe(true);
    // skills alone still clear the gate
    expect(scoreJob({ ...baseFacts, skillIds: [1, 2] }, job).hasSignal).toBe(
      true
    );
  });

  it("matches seniority on the title band", () => {
    const f = { ...baseFacts, seniority: "senior" as const };
    expect(sectionScore(scoreJob(f, job), "seniority")).toBe(100);
    expect(
      sectionScore(
        scoreJob(f, { ...job, title: "Junior Engineer" }),
        "seniority"
      )
    ).toBe(40);
  });

  it("combines the title band with the years band when both are present", () => {
    const f = {
      ...baseFacts,
      seniority: "senior" as const,
      yearsOfExperience: 8,
    };
    expect(
      sectionScore(scoreJob(f, { ...job, experienceRequired: 8 }), "seniority")
    ).toBe(100);
    // title band 100 (senior/senior) averaged with years band 50 (over by 5)
    expect(
      sectionScore(scoreJob(f, { ...job, experienceRequired: 3 }), "seniority")
    ).toBe(75);
  });

  it("scores work type 100 on exact match and 0 on mismatch", () => {
    const f = { ...baseFacts, workType: "remote" as const };
    expect(
      sectionScore(scoreJob(f, { ...job, workType: "remote" }), "workType")
    ).toBe(100);
    expect(
      sectionScore(scoreJob(f, { ...job, workType: "hybrid" }), "workType")
    ).toBe(0);
  });

  it("matches location on a shared significant token", () => {
    const f = { ...baseFacts, preferredLocation: "New York" };
    expect(
      sectionScore(
        scoreJob(f, { ...job, location: "New York, NY" }),
        "location"
      )
    ).toBe(100);
    expect(
      sectionScore(scoreJob(f, { ...job, location: "Austin, TX" }), "location")
    ).toBe(0);
    expect(sectionScore(scoreJob(f, job), "location")).toBeNull();
  });

  it("skips location for remote arrangements", () => {
    const f = { ...baseFacts, preferredLocation: "New York" };
    expect(
      sectionScore(scoreJob(f, { ...job, workType: "remote" }), "location")
    ).toBeNull();
    expect(
      sectionScore(
        scoreJob({ ...f, workType: "remote" as const }, job),
        "location"
      )
    ).toBeNull();
  });

  it("matches role id, mismatches, or stays null", () => {
    const f = { ...baseFacts, roleIds: [5] };
    expect(sectionScore(scoreJob(f, { ...job, roleId: 5 }), "role")).toBe(100);
    expect(sectionScore(scoreJob(f, { ...job, roleId: 6 }), "role")).toBe(0);
    expect(sectionScore(scoreJob(f, job), "role")).toBeNull();
    expect(
      sectionScore(scoreJob(baseFacts, { ...job, roleId: 5 }), "role")
    ).toBeNull();
  });

  it("adds the salary bonus when the job's top reaches the expected band", () => {
    const f = {
      ...baseFacts,
      skillIds: [1, 2],
      salaryExpected: 150_000,
      salaryLower: 100_000,
    };
    const plain = scoreJob(f, job);
    const matched = scoreJob(f, {
      ...job,
      salaryLower: 160_000,
      salaryUpper: 180_000,
    });
    expect(matched.overall - plain.overall).toBe(5);
  });

  it("deducts when the job's reachable top is below the floor", () => {
    const f = {
      ...baseFacts,
      skillIds: [1, 2],
      salaryExpected: 150_000,
      salaryLower: 100_000,
    };
    const plain = scoreJob(f, job);
    const below = scoreJob(f, { ...job, salaryLower: 60_000 });
    expect(below.overall).toBeLessThan(plain.overall);
  });

  it("treats a lone job salary bound as a fixed point", () => {
    const f = {
      ...baseFacts,
      skillIds: [1, 2],
      salaryExpected: 150_000,
      salaryLower: 100_000,
    };
    const plain = scoreJob(f, job);
    // "from 60k" only -> fixed 60k, below the 100k floor
    const openEnded = scoreJob(f, { ...job, salaryLower: 60_000 });
    expect(openEnded.overall).toBeLessThan(plain.overall);
  });

  it("skips the salary modifier when currencies do not match", () => {
    const f = {
      ...baseFacts,
      skillIds: [1, 2],
      currency: "USD",
      salaryExpected: 150_000,
      salaryLower: 100_000,
    };
    const plain = scoreJob(f, job);
    const mismatched = scoreJob(f, {
      ...job,
      currency: "EUR",
      salaryLower: 60_000,
    });
    expect(mismatched.overall).toBe(plain.overall);
  });
});
