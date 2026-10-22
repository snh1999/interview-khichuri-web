import { describe, expect, it } from "vitest";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import {
  applyExtractedLookupIds,
  collectExtractedLookupNames,
  EMPTY_FORM,
  profileApplySchema,
  type TResumeContent,
} from "@/components/resume/job-profile/resume.helpers.ts";

const identity = {
  personal: { email: "me@example.com", firstName: "Me", lastName: "X" },
  professional: { title: "Engineer" },
};

describe("profileApplySchema", () => {
  it("keeps profile lookup ids and skill names instead of rejecting them", () => {
    const result = profileApplySchema.parse({
      ...EMPTY_FORM,
      ...identity,
      professional: {
        ...identity.professional,
        industries: [2],
        industriesNames: ["Tech"],
        skillNames: ["React"],
        skills: [1],
      },
      projects: [
        {
          name: "Proj",
          skillNames: ["React"],
          skills: [1],
          type: "project",
        },
      ],
    });

    expect(result.professional.skills).toEqual([1]);
    expect(result.professional.skillNames).toEqual(["React"]);
    expect(result.projects?.[0]?.skills).toEqual([1]);
  });

  it("coerces extracted date strings", () => {
    const result = profileApplySchema.parse({
      ...EMPTY_FORM,
      ...identity,
      workExperience: [
        {
          company: "X",
          isCurrent: true,
          responsibilities: "Did things",
          startDate: "2020-01-01",
          title: "Dev",
        },
      ],
    });

    expect(result.workExperience?.[0]?.startDate).toBeInstanceOf(Date);
  });
});

describe("collectExtractedLookupNames", () => {
  it("collects names from a PDF extraction", () => {
    const content = {
      personal: {},
      professional: {
        industries: ["Tech"],
        skills: [
          "React",
          "Node",
          42,
          "A skill name that is far too long to keep",
        ],
      },
      workExperience: [],
      education: [],
      projects: [
        { name: "A", skills: ["React"] },
        { name: "B", skills: [] },
      ],
      publications: [],
      references: [],
      links: [],
    } as unknown as TResumeContent;

    expect(collectExtractedLookupNames(content)).toEqual({
      industries: ["Tech"],
      professional: ["React", "Node"],
      projects: [
        { id: undefined, name: "A", skills: ["React"] },
        { id: undefined, name: "B", skills: [] },
      ],
    });
  });

  it("collects names from a generated resume's skill groups", () => {
    const content = {
      personal: {},
      professional: {},
      workExperience: [],
      education: [],
      projects: [{ id: 7, name: "A", skills: "React, CSS" }],
      publications: [],
      references: [],
      links: [],
      skillGroups: [{ id: "1", keywords: "React, Node", label: "Others" }],
    } as unknown as TResumeContent;

    expect(collectExtractedLookupNames(content)).toEqual({
      industries: [],
      professional: ["React", "Node"],
      projects: [{ id: 7, name: "A", skills: ["React", "CSS"] }],
    });
  });
});

describe("applyExtractedLookupIds", () => {
  const idsByName = {
    industries: new Map([["tech", 4]]),
    topics: new Map([
      ["react", 1],
      ["node", 2],
      ["vue", 3],
    ]),
  };

  it("resolves existing ids, drops unknowns, and matches projects by identity", () => {
    const data = {
      ...EMPTY_FORM,
      professional: {
        industries: [5],
        skillNames: [],
        skills: [9],
        title: "Engineer",
      },
      projects: [
        { id: 2, name: "B", skills: [7], type: "project" },
        { id: 1, name: "A", skills: [], type: "project" },
      ],
    } as unknown as TProfileFormData;

    const result = applyExtractedLookupIds(
      data,
      {
        industries: ["Tech"],
        professional: ["React", "Vue", "Missing"],
        projects: [
          { id: 1, name: "A", skills: ["Node"] },
          { name: "B", skills: ["React"] },
        ],
      },
      idsByName
    );

    expect(result.professional.skills).toEqual([9, 1, 3]);
    expect(result.professional.industries).toEqual([5, 4]);
    expect(result.projects?.[0]?.skills).toEqual([7, 1]);
    expect(result.projects?.[1]?.skills).toEqual([2]);
  });

  it("drops unmatched extracted names instead of keeping or creating them", () => {
    const data = {
      ...EMPTY_FORM,
      professional: {
        skills: ["React", "Missing"],
        title: "Engineer",
      },
      projects: [{ id: 1, name: "A", skills: ["Missing"], type: "project" }],
    } as unknown as TProfileFormData;

    const result = applyExtractedLookupIds(
      data,
      {
        industries: ["Also missing"],
        professional: ["React", "Missing"],
        projects: [{ id: 1, name: "A", skills: ["Missing"] }],
      },
      idsByName
    );

    expect(result.professional.skills).toEqual([1]);
    expect(result.professional.industries).toEqual([]);
    expect(result.projects?.[0]?.skills).toEqual([]);
  });

  it("matches an extracted project by position after it is renamed", () => {
    const data = {
      ...EMPTY_FORM,
      professional: { title: "Engineer" },
      projects: [{ name: "A renamed", skills: [7], type: "project" }],
    } as unknown as TProfileFormData;

    const result = applyExtractedLookupIds(
      data,
      {
        industries: [],
        professional: [],
        projects: [{ name: "A", skills: ["React"] }],
      },
      idsByName
    );

    expect(result.projects?.[0]?.skills).toEqual([7, 1]);
  });

  it("leaves existing ids untouched when no name matches", () => {
    const data = {
      ...EMPTY_FORM,
      professional: { skills: [9], title: "Engineer" },
      projects: [{ id: 1, name: "A", skills: [7], type: "project" }],
    } as unknown as TProfileFormData;

    const result = applyExtractedLookupIds(
      data,
      {
        industries: [],
        professional: ["Missing"],
        projects: [{ id: 1, name: "A", skills: ["Missing"] }],
      },
      idsByName
    );

    expect(result.professional.skills).toEqual([9]);
    expect(result.projects?.[0]?.skills).toEqual([7]);
  });
});
