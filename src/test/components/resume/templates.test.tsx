import { describe, expect, it } from "vitest";
import type { TResumeFormData } from "@/components/resume/job-profile/resume.helpers.ts";
import { RenderProvider } from "@/components/resume/PDFAdapter.tsx";
import {
  DataScienceTechTemplate,
  dataScienceTemplateConfig,
} from "@/components/resume/templates/DataScienceTechTemplate.tsx";
import {
  JakeResumeTemplate,
  jakesTemplateConfig,
} from "@/components/resume/templates/JakesTemplate.tsx";
import {
  MbzuaiTemplate,
  mbzuaiTemplateConfig,
} from "@/components/resume/templates/MbzuaiTemplate.tsx";
import { render } from "@/test/render.tsx";

const FRONTEND_RE = /Frontend Engineer/;
const PORTFOLIO_RE = /Portfolio/;
const HACKATHON_RE = /Hackathon/;
const LANG_RE = /Languages:/;
const COURSEWORK_RE = /Relevant Coursework/;
const ENGINEER_RE = /Engineer/;

const DATA = {
  activities: [
    {
      endDate: new Date(2021, 1, 1),
      id: "act-1",
      isCurrent: false,
      name: "Hackathon",
      notes: "Built a thing\nWon prize",
      organization: "ACME",
      position: "Winner",
      startDate: new Date(2021, 0, 1),
    },
  ],
  education: [
    {
      coursework: ["Algorithms", "Logic"],
      degreeName: "BSc",
      endDate: new Date(1836, 0, 1),
      fieldOfStudy: "Computer Science",
      id: "edu-1",
      institution: "University of London",
      notes: "First class honours",
      startDate: new Date(1832, 0, 1),
    },
  ],
  links: [{ url: "https://github.com/ada" }],
  personal: {
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    phone: "555-0100",
  },
  professional: { summary: "Pioneering programmer." },
  projects: [
    {
      description: "Built a site\nWrote docs",
      id: "proj-1",
      name: "Portfolio",
      skills: "React, TypeScript",
      type: "research",
    },
  ],
  publications: [
    {
      authors: ["Ada Lovelace", "Alan Turing"],
      id: "pub-1",
      link: "https://doi.org/x",
      notes: "Cited widely",
      publicationType: "Journal",
      title: "A paper",
    },
  ],
  skillGroups: [{ id: "g-1", keywords: "JavaScript", label: "Languages" }],
  workExperience: [
    {
      company: "Acme Corp",
      endDate: new Date(2022, 0, 1),
      id: "exp-1",
      isCurrent: true,
      location: "Remote",
      responsibilities: "Led the team\nShipped features",
      startDate: new Date(2020, 0, 1),
      title: "Frontend Engineer",
    },
  ],
} as unknown as TResumeFormData;

const SPARSE = {
  activities: [],
  education: [],
  links: [],
  personal: { email: "ann@example.com", firstName: "Ann", lastName: "Lee" },
  professional: {},
  projects: [],
  publications: [],
  skillGroups: [],
  workExperience: [],
} as unknown as TResumeFormData;

describe("JakeResumeTemplate", () => {
  it("renders a bare profile without crashing", () => {
    const { getByText, queryByText } = render(
      <RenderProvider mode="web">
        <JakeResumeTemplate
          data={SPARSE}
          sections={jakesTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Ann Lee")).toBeInTheDocument();
    expect(queryByText(HACKATHON_RE)).not.toBeInTheDocument();
  });
  it("renders the header, contact links and every enabled section", () => {
    const { getByText, getByRole } = render(
      <RenderProvider mode="web">
        <JakeResumeTemplate
          data={DATA}
          sections={jakesTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Ada Lovelace")).toBeInTheDocument();
    expect(getByText("Pioneering programmer.")).toBeInTheDocument();
    expect(getByText("555-0100")).toBeInTheDocument();
    expect(getByRole("link", { name: "ada@example.com" })).toBeInTheDocument();
    expect(getByRole("link", { name: "github.com/ada" })).toBeInTheDocument();

    expect(getByText("Frontend Engineer")).toBeInTheDocument();
    expect(getByText("Acme Corp")).toBeInTheDocument();
    expect(getByText("Led the team")).toBeInTheDocument();
    expect(getByText("Portfolio")).toBeInTheDocument();
    expect(getByText("React, TypeScript")).toBeInTheDocument();
    expect(getByText(LANG_RE)).toBeInTheDocument();
    expect(getByText("A paper")).toBeInTheDocument();
    expect(getByText("Ada Lovelace, Alan Turing")).toBeInTheDocument();
    expect(getByText(COURSEWORK_RE)).toBeInTheDocument();
    expect(getByText(HACKATHON_RE)).toBeInTheDocument();
  });

  it("hides sections that are disabled", () => {
    const sections = (jakesTemplateConfig.sections ?? []).map((section) => ({
      ...section,
      enabled: section.id !== "workExperience",
    }));

    const { queryByText } = render(
      <RenderProvider mode="web">
        <JakeResumeTemplate data={DATA} sections={sections} />
      </RenderProvider>
    );

    expect(queryByText("Frontend Engineer")).not.toBeInTheDocument();
  });
});

describe("DataScienceTechTemplate", () => {
  it("renders summary, experience, projects and publications", () => {
    const { getByText } = render(
      <RenderProvider mode="web">
        <DataScienceTechTemplate
          data={DATA}
          sections={dataScienceTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Pioneering programmer.")).toBeInTheDocument();
    expect(getByText("BSc in Computer Science")).toBeInTheDocument();
    expect(getByText(", University of London")).toBeInTheDocument();
    expect(getByText("TECHNICAL EXPERIENCE")).toBeInTheDocument();
    expect(getByText("Frontend Engineer")).toBeInTheDocument();
    expect(getByText("Led the team")).toBeInTheDocument();
    expect(getByText("Portfolio")).toBeInTheDocument();
    expect(getByText("A paper")).toBeInTheDocument();
    expect(getByText("JavaScript")).toBeInTheDocument();
    expect(getByText(HACKATHON_RE)).toBeInTheDocument();
  });

  it("renders a bare profile without crashing", () => {
    const { getByText, queryByText } = render(
      <RenderProvider mode="web">
        <DataScienceTechTemplate
          data={SPARSE}
          sections={dataScienceTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Ann Lee")).toBeInTheDocument();
    expect(queryByText("A paper")).not.toBeInTheDocument();
  });
});

describe("MbzuaiTemplate", () => {
  it("renders the header, experience, projects and skills", () => {
    const { getAllByText, getByText } = render(
      <RenderProvider mode="web">
        <MbzuaiTemplate
          data={DATA}
          sections={mbzuaiTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Ada Lovelace")).toBeInTheDocument();
    expect(getByText("Pioneering programmer.")).toBeInTheDocument();
    expect(getAllByText(FRONTEND_RE).length).toBeGreaterThan(0);
    expect(getAllByText(PORTFOLIO_RE).length).toBeGreaterThan(0);
    expect(getByText("JavaScript")).toBeInTheDocument();
    expect(getAllByText(HACKATHON_RE).length).toBeGreaterThan(0);
  });

  it("renders a bare profile without crashing", () => {
    const { getByText, queryByText } = render(
      <RenderProvider mode="web">
        <MbzuaiTemplate
          data={SPARSE}
          sections={mbzuaiTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Ann Lee")).toBeInTheDocument();
    expect(queryByText(PORTFOLIO_RE)).not.toBeInTheDocument();
  });
});

const MINIMAL = {
  activities: [
    {
      endDate: new Date(2021, 1, 1),
      id: "act-1",
      isCurrent: false,
      name: "Volunteering",
      startDate: new Date(2021, 0, 1),
    },
  ],
  education: [
    {
      degreeName: "BSc",
      endDate: new Date(2020, 0, 1),
      id: "edu-1",
      institution: "Uni",
      isCurrent: false,
      startDate: new Date(2016, 0, 1),
    },
  ],
  links: [],
  personal: { email: "kim@example.com", firstName: "Kim", lastName: "Ng" },
  professional: { summary: "Engineer." },
  projects: [{ id: "proj-1", name: "Thing" }],
  publications: [{ authors: [], id: "pub-1", title: "Untitled" }],
  skillGroups: [{ id: "g-1", keywords: "Go", label: "Stack" }],
  workExperience: [
    {
      company: "Globex",
      endDate: new Date(2023, 0, 1),
      id: "exp-1",
      isCurrent: false,
      startDate: new Date(2021, 0, 1),
      title: "Engineer",
    },
  ],
} as unknown as TResumeFormData;

describe("templates with minimal item fields", () => {
  it("renders JakeResumeTemplate without optional detail", () => {
    const { getByText } = render(
      <RenderProvider mode="web">
        <JakeResumeTemplate
          data={MINIMAL}
          sections={jakesTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Kim Ng")).toBeInTheDocument();
    expect(getByText("Engineer")).toBeInTheDocument();
    expect(getByText("Globex")).toBeInTheDocument();
  });

  it("renders DataScienceTechTemplate without optional detail", () => {
    const { getAllByText, getByText } = render(
      <RenderProvider mode="web">
        <DataScienceTechTemplate
          data={MINIMAL}
          sections={dataScienceTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getAllByText(ENGINEER_RE).length).toBeGreaterThan(0);
    expect(getByText("Thing")).toBeInTheDocument();
  });

  it("renders MbzuaiTemplate without optional detail", () => {
    const { getAllByText, getByText } = render(
      <RenderProvider mode="web">
        <MbzuaiTemplate
          data={MINIMAL}
          sections={mbzuaiTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Kim Ng")).toBeInTheDocument();
    expect(getAllByText(ENGINEER_RE).length).toBeGreaterThan(0);
  });
});

const RICH = {
  activities: [
    {
      endDate: new Date(2019, 1, 1),
      isCurrent: false,
      name: "Conf",
      notes: "Talk",
      organization: "Org",
      position: "Speaker",
      startDate: new Date(2019, 0, 1),
    },
  ],
  education: [
    {
      coursework: ["ML"],
      degreeName: "MSc",
      endDate: new Date(2012, 0, 1),
      fieldOfStudy: "AI",
      institution: "MIT",
      isCurrent: false,
      location: "Cambridge",
      notes: "Hons",
      startDate: new Date(2010, 0, 1),
      thesis: "On learning",
    },
  ],
  links: [
    { type: "github", url: "https://github.com/ray" },
    { url: "https://blog.ray.dev" },
  ],
  personal: {
    email: "ray@example.com",
    firstName: "Ray",
    lastName: "Mon",
    location: "Boston",
    nationality: "US",
    phone: "555-0123",
  },
  professional: { summary: "Researcher." },
  projects: [
    {
      description: "One\nTwo",
      name: "Research Thing",
      skills: "Python, R",
      type: "research",
    },
  ],
  publications: [
    {
      authors: ["R Mon"],
      link: "https://doi.org/y",
      notes: "Cited",
      publicationType: "Conference",
      title: "Paper",
    },
  ],
  references: [
    {
      company: "Uni",
      email: "who@example.com",
      name: "Dr Who",
      phone: "555-1",
      title: "Prof",
    },
  ],
  skillGroups: [
    { label: "Langs", keywords: "Python" },
    { keywords: "Docker", label: "" },
  ],
  workExperience: [
    {
      company: "Globex",
      endDate: new Date(2022, 0, 1),
      isCurrent: false,
      location: "Remote",
      responsibilities: "Did X\nDid Y",
      startDate: new Date(2020, 0, 1),
      title: "Engineer",
    },
  ],
} as unknown as TResumeFormData;

describe("templates with rich optional detail", () => {
  it("renders MbzuaiTemplate with every optional field", () => {
    const { getByText } = render(
      <RenderProvider mode="web">
        <MbzuaiTemplate
          data={RICH}
          sections={mbzuaiTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Ray Mon")).toBeInTheDocument();
    expect(getByText("Nationality: US")).toBeInTheDocument();
    expect(getByText("Dr Who")).toBeInTheDocument();
    expect(getByText("On learning")).toBeInTheDocument();
  });

  it("renders DataScienceTechTemplate with every optional field", () => {
    const { getByText } = render(
      <RenderProvider mode="web">
        <DataScienceTechTemplate
          data={RICH}
          sections={dataScienceTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Ray Mon")).toBeInTheDocument();
  });

  it("renders JakeResumeTemplate with every optional field", () => {
    const { getByText } = render(
      <RenderProvider mode="web">
        <JakeResumeTemplate
          data={RICH}
          sections={jakesTemplateConfig.sections ?? []}
        />
      </RenderProvider>
    );

    expect(getByText("Ray Mon")).toBeInTheDocument();
  });
});
