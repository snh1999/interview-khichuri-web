import { describe, expect, it } from "vitest";
import type { TProfilePopulated } from "@/api/profile/profile.types.ts";
import { profileToFormData } from "@/components/job-profile/profile.helpers.ts";

const emptyProfile = {} as TProfilePopulated;

const fullProfile = {
  activities: [
    {
      endDate: "2023-05-01T00:00:00.000Z",
      id: 1,
      isCurrent: false,
      name: "Hackathon",
      notes: "note",
      organization: "ACME",
      position: "Winner",
      startDate: "2023-01-01T00:00:00.000Z",
    },
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  educations: [
    {
      degreeName: "BSc",
      endDate: "2020-06-01T00:00:00.000Z",
      gpa: "3.9",
      id: "edu-1",
      institution: "University",
      isCurrent: false,
      startDate: "2016-09-01T00:00:00.000Z",
    },
  ],
  email: "ada@example.com",
  firstName: "Ada",
  id: "profile-1",
  jobPreferences: [
    {
      titles: [{ id: 1, roleId: 7 }],
    },
  ],
  lastName: "Lovelace",
  links: [{ id: 1, profileId: "profile-1", type: "github", url: "https://x" }],
  projects: [
    {
      id: 1,
      name: "Portfolio",
      skills: [{ topic: { id: 3, name: "React" }, topicId: 3 }],
      type: "research",
    },
  ],
  publications: [
    {
      authors: ["Ada Lovelace"],
      id: 1,
      link: null,
      notes: null,
      publicationType: null,
      title: "On Engines",
      year: null,
    },
  ],
  references: [
    {
      company: null,
      email: "ref@example.com",
      id: 1,
      name: "Charles",
      notes: null,
      phone: null,
      relationType: null,
      title: "Professor",
    },
  ],
  updatedAt: "2024-01-01T00:00:00.000Z",
  workExperiences: [
    {
      company: "Acme",
      endDate: null,
      id: "exp-1",
      isCurrent: true,
      startDate: "2020-07-01T00:00:00.000Z",
      title: "Engineer",
    },
  ],
  workOverviews: [
    {
      id: 1,
      industries: [{ industryId: 5 }],
      skills: [{ topicId: 3 }],
      title: "Engineer",
    },
  ],
} as unknown as TProfilePopulated;

const sparseProfile = {
  activities: [{ id: 1, isCurrent: true, name: "Hackathon" }],
  educations: [
    {
      degreeName: "BSc",
      id: "edu-1",
      institution: "University",
      isCurrent: true,
    },
  ],
  projects: [{ id: 1, name: "Portfolio" }],
  publications: [{ id: 1, title: "On Engines" }],
  references: [{ id: 1, name: "Charles", email: null }],
  workExperiences: [
    {
      company: "Acme",
      endDate: "2020-12-01T00:00:00.000Z",
      id: "exp-1",
      isCurrent: false,
      title: "Engineer",
    },
  ],
} as unknown as TProfilePopulated;

describe("profileToFormData", () => {
  it("returns empty collections for a bare profile", () => {
    const data = profileToFormData(emptyProfile);

    expect(data.activities).toEqual([]);
    expect(data.education).toEqual([]);
    expect(data.links).toEqual([]);
    expect(data.projects).toEqual([]);
    expect(data.publications).toEqual([]);
    expect(data.references).toEqual([]);
    expect(data.workExperience).toEqual([]);
    expect(data.preferences.titles).toEqual([]);
    expect(data.professional).toEqual({
      industries: [],
      industriesNames: [],
      skillNames: [],
      skills: [],
      title: "",
    });
  });

  it("maps a populated profile into form data", () => {
    const data = profileToFormData(fullProfile);

    expect(data.activities[0]).toMatchObject({
      endDate: new Date("2023-05-01T00:00:00.000Z"),
      name: "Hackathon",
    });
    expect(data.education[0]?.startDate).toBeInstanceOf(Date);
    expect(data.links).toHaveLength(1);
    expect(data.preferences.titles).toEqual([7]);
    expect(data.professional).toMatchObject({
      industries: [5],
      skills: [3],
      title: "Engineer",
    });
    expect(data.projects[0]).toMatchObject({
      name: "Portfolio",
      skillNames: ["React"],
      skills: [3],
      type: "research",
    });
    expect(data.publications[0]).toMatchObject({
      authors: ["Ada Lovelace"],
      link: undefined,
      title: "On Engines",
    });
    expect(data.references[0]).toMatchObject({
      company: undefined,
      name: "Charles",
    });
    expect(data.workExperience[0]?.startDate).toBeInstanceOf(Date);
  });

  it("maps sparse items with absent optional fields", () => {
    const data = profileToFormData(sparseProfile);

    expect(data.activities[0]).toMatchObject({
      endDate: undefined,
      notes: undefined,
      organization: undefined,
      position: undefined,
      startDate: undefined,
    });
    expect(data.education[0]?.endDate).toBeUndefined();
    expect(data.education[0]?.startDate).toBeUndefined();
    expect(data.projects[0]).toMatchObject({
      skillNames: [],
      skills: [],
      type: "project",
    });
    expect(data.publications[0]).toMatchObject({
      authors: [],
      link: undefined,
    });
    expect(data.references[0]).toMatchObject({
      company: undefined,
      email: undefined,
    });
    expect(data.workExperience[0]?.endDate).toBeInstanceOf(Date);
    expect(data.workExperience[0]?.startDate).toBeUndefined();
  });
});
