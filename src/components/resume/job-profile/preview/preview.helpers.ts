import type { TExtractionResult } from "@/api/profile";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import { formatToString } from "@/components/resume/utils.ts";

export type TValue =
  | string
  | number
  | boolean
  | Date
  | Array<string | number>
  | null
  | undefined;

export type TPick = "before" | "after";

const numericArrayEqual = (b: number[], a: number[]): boolean => {
  if (b.length !== a.length) {
    return false;
  }
  const aIds = new Set(a);
  return b.every((id) => aIds.has(id));
};

const rawEqual = (b: unknown, a: unknown): boolean => {
  if (
    Array.isArray(b) &&
    Array.isArray(a) &&
    b.every((entry) => typeof entry === "number") &&
    a.every((entry) => typeof entry === "number")
  ) {
    return numericArrayEqual(b, a);
  }
  return formatToString(b) === formatToString(a);
};

export interface IRow {
  key: string;
  section: string;
  field: string;
  arrayIndex?: number;
  label: string;
  before: string | null;
  after: string | null;
  changed: boolean;
}

export interface IRowGroups {
  personalRows: IRow[];
  professionalRows: IRow[];
  preferencesRows: IRow[];
  workExperienceRows: IRow[];
  educationRows: IRow[];
  linkRows: IRow[];
  publicationRows: IRow[];
  projectRows: IRow[];
  referenceRows: IRow[];
  activityRows: IRow[];
}

export const PERSONAL_LABELS = {
  email: "Email",
  firstName: "First Name",
  lastName: "Last Name",
  phone: "Phone",
  location: "Location",
  country: "Country",
  nationality: "Nationality",
} as const;

export const PROFESSIONAL_LABELS = {
  title: "Title",
  experienceLevel: "Experience Level",
  yearsOfExperience: "Years of Experience",
  summary: "Summary",
  skills: "Skills",
  skillNames: "Skill Names",
  industries: "Industries",
  industriesNames: "Industry Names",
} as const;

export const PREFERENCES_LABELS = {
  workType: "Work Type",
  preferredLocation: "Preferred Location",
  salaryLower: "Salary Lower",
  salaryExpected: "Salary Expected",
  currency: "Currency",
  titles: "Titles",
  coverLetterTemplate: "Cover Letter Template",
  coverLetterTone: "Cover Letter Tone",
} as const;

export const WORK_EXPERIENCE_LABELS = {
  company: "Company",
  title: "Title",
  location: "Location",
  isCurrent: "Current",
  startDate: "Start Date",
  endDate: "End Date",
  responsibilities: "Responsibilities",
} as const;

export const EDUCATION_LABELS = {
  degreeName: "Degree",
  institution: "Institution",
  fieldOfStudy: "Field of Study",
  gpa: "GPA",
  isCurrent: "Current",
  startDate: "Start Date",
  endDate: "End Date",
  location: "Location",
  coursework: "Coursework",
  thesis: "Thesis",
  notes: "Notes",
} as const;

export const LINK_LABELS = {
  type: "Type",
  url: "URL",
} as const;

export const PUBLICATION_LABELS = {
  title: "Title",
  authors: "Authors",
  year: "Year",
  publicationType: "Type",
  link: "Link",
  notes: "Notes",
} as const;

export const PROJECT_LABELS = {
  name: "Name",
  type: "Type",
  description: "Description",
  link: "Link",
  skills: "Skills",
} as const;

export const REFERENCE_LABELS = {
  name: "Name",
  title: "Title",
  company: "Company",
  relationType: "Relation",
  email: "Email",
  phone: "Phone",
  notes: "Notes",
} as const;

export const ACTIVITY_LABELS = {
  name: "Name",
  organization: "Organization",
  position: "Position",
  isCurrent: "Current",
  startDate: "Start Date",
  endDate: "End Date",
  notes: "Notes",
} as const;

const scalarRows = (
  section: string,
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown> | undefined,
  labels: Record<string, string>
): IRow[] =>
  Object.entries(labels).map(([field, label]) => {
    const b = formatToString(before?.[field] as TValue);
    const a = formatToString(after?.[field] as TValue);
    return {
      key: `${section}.${field}`,
      section,
      field,
      label,
      before: b,
      after: a,
      changed: !rawEqual(before?.[field], after?.[field]),
    };
  });

const arrayRows = (
  section: string,
  before: Record<string, unknown>[] | undefined,
  after: Record<string, unknown>[] | undefined,
  labels: Record<string, string>
): IRow[] => {
  const count = Math.max(before ? before.length : 0, after ? after.length : 0);
  const rows: IRow[] = [];
  for (let index = 0; index < count; index += 1) {
    for (const [field, label] of Object.entries(labels)) {
      const b = formatToString(before?.[index]?.[field] as TValue, "selected");
      const a = formatToString(after?.[index]?.[field] as TValue, "selected");
      rows.push({
        key: `${section}.${index}.${field}`,
        section,
        field,
        arrayIndex: index,
        label: `${label} #${index + 1}`,
        before: b,
        after: a,
        changed: !rawEqual(before?.[index]?.[field], after?.[index]?.[field]),
      });
    }
  }
  return rows;
};

export const buildRowGroups = (
  before: TProfileFormData | undefined,
  data: TExtractionResult
): IRowGroups => ({
  personalRows: scalarRows(
    "personal",
    before?.personal,
    data.personal,
    PERSONAL_LABELS
  ),
  professionalRows: scalarRows(
    "professional",
    before?.professional,
    data.professional,
    PROFESSIONAL_LABELS
  ),
  preferencesRows: scalarRows(
    "preferences",
    before?.preferences,
    data.preferences,
    PREFERENCES_LABELS
  ),
  workExperienceRows: arrayRows(
    "workExperience",
    before?.workExperience,
    data.workExperience,
    WORK_EXPERIENCE_LABELS
  ),
  educationRows: arrayRows(
    "education",
    before?.education,
    data.education,
    EDUCATION_LABELS
  ),
  linkRows: arrayRows("links", before?.links, data.links, LINK_LABELS),
  publicationRows: arrayRows(
    "publications",
    before?.publications,
    data.publications,
    PUBLICATION_LABELS
  ),
  projectRows: arrayRows(
    "projects",
    before?.projects,
    data.projects,
    PROJECT_LABELS
  ),
  referenceRows: arrayRows(
    "references",
    before?.references,
    data.references,
    REFERENCE_LABELS
  ),
  activityRows: arrayRows(
    "activities",
    before?.activities,
    data.activities,
    ACTIVITY_LABELS
  ),
});

export const flattenRowGroups = (groups: IRowGroups): IRow[] =>
  Object.values(groups).flat();

const buildSelections = (rows: IRow[], pick: TPick): Record<string, TPick> => {
  const map: Record<string, TPick> = {};
  for (const row of rows) {
    if (row.changed) {
      map[row.key] = pick;
    }
  }
  return map;
};

export const defaultSelections = (rows: IRow[]): Record<string, TPick> =>
  buildSelections(rows, "before");

export const allAfterSelections = (rows: IRow[]): Record<string, TPick> =>
  buildSelections(rows, "after");

const isValidValue = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  !(Array.isArray(value) && value.length === 0);

const readRaw = (
  source: object | undefined,
  section: string,
  arrayIndex: number | undefined,
  field: string
): unknown => {
  const sectionValue = (source as Record<string, unknown> | undefined)?.[
    section
  ];
  if (arrayIndex === undefined) {
    return (sectionValue as Record<string, unknown> | undefined)?.[field];
  }
  return (sectionValue as Record<string, unknown>[] | undefined)?.[
    arrayIndex
  ]?.[field];
};

const setSectionField = (
  result: TProfileFormData,
  section: string,
  arrayIndex: number | undefined,
  field: string,
  value: unknown
): void => {
  const target = result as Record<string, unknown>;
  if (arrayIndex === undefined) {
    target[section] = {
      ...((target[section] ?? {}) as Record<string, unknown>),
      [field]: value,
    };
  } else {
    const arr = [...((target[section] ?? []) as Record<string, unknown>[])];
    arr[arrayIndex] = { ...(arr[arrayIndex] ?? {}), [field]: value };
    target[section] = arr;
  }
};

const SECTIONS_WITH_ARRAY = [
  "workExperience",
  "education",
  "links",
  "publications",
  "projects",
  "references",
  "activities",
] as const;

export const buildMergedData = (
  rows: IRow[],
  selections: Record<string, TPick>,
  edits: Record<string, string>,
  before: TProfileFormData | undefined,
  data: TExtractionResult
): TProfileFormData => {
  const result = structuredClone(before ?? {}) as TProfileFormData;

  for (const row of rows) {
    if (row.changed && edits[row.key] !== undefined) {
      setSectionField(
        result,
        row.section,
        row.arrayIndex,
        row.field,
        edits[row.key]
      );
      continue;
    }

    const pick: TPick = row.changed
      ? (selections[row.key] ?? (row.before ? "before" : "after"))
      : "after";

    const raw =
      pick === "after"
        ? readRaw(data, row.section, row.arrayIndex, row.field)
        : readRaw(before, row.section, row.arrayIndex, row.field);

    if (isValidValue(raw)) {
      setSectionField(result, row.section, row.arrayIndex, row.field, raw);
    }
  }

  for (const section of SECTIONS_WITH_ARRAY) {
    const value = result[section];
    if (Array.isArray(value)) {
      (result as Record<string, unknown>)[section] = value.filter(
        (entry) => entry !== undefined && entry !== null
      );
    }
  }

  return result;
};
