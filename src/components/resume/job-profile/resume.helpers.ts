import { z } from "zod";
import {
  MAX_LARGE_LENGTH,
  MAX_SHORT_LENGTH,
  MAX_TINY_LENGTH,
} from "@/app.constants.ts";
import {
  activitySchema,
  educationSchema,
  personalSchema,
  preferencesSchema,
  professionalSchema,
  profileFormSchema,
  profileLinkSchema,
  projectSchema,
  publicationSchema,
  referenceSchema,
  type TProfileFormData,
  workExperienceSchema,
} from "@/components/job-profile/profile.helpers.ts";
import { normalizeLookupName, stringToDate } from "@/lib/utils.ts";

const dateOrNull = z.coerce.date().nullish();

export const MAX_SKILL_GROUPS = 5;

export const skillGroupSchema = z.object({
  id: z.string(),
  label: z.string().trim().max(MAX_SHORT_LENGTH),
  keywords: z.string().trim().max(MAX_LARGE_LENGTH),
});

export const skillGroupFormSchema = skillGroupSchema.extend({
  keywords: z.string().trim().min(1, "Enter at least one skill"),
});
export type TSkillGroupDto = z.infer<typeof skillGroupSchema>;

const resumeProfessionalSchema = professionalSchema.omit({
  industries: true,
  industriesNames: true,
  skillNames: true,
  skills: true,
});

const resumeProjectSchema = projectSchema.omit({ skillNames: true }).extend({
  skills: z.string().trim().max(MAX_LARGE_LENGTH).optional(),
});

const extractedNameList = z.array(z.string().trim().min(1)).nullish();

export const resumeExtractionSchema = z.object({
  personal: personalSchema.extend({ phone: z.string().nullish() }).partial(),
  professional: resumeProfessionalSchema.partial().extend({
    industries: extractedNameList,
    skills: extractedNameList,
  }),
  workExperience: z.array(
    workExperienceSchema
      .extend({ endDate: dateOrNull, startDate: dateOrNull })
      .partial()
  ),
  education: z.array(
    educationSchema
      .extend({ endDate: dateOrNull, startDate: dateOrNull })
      .partial()
  ),
  activities: z
    .array(
      activitySchema
        .extend({ endDate: dateOrNull, startDate: dateOrNull })
        .partial()
    )
    .optional(),
  projects: z
    .array(
      resumeProjectSchema.partial().extend({
        skills: z.union([z.string(), z.array(z.string())]).optional(),
      })
    )
    .optional(),
  publications: z.array(publicationSchema.partial()).optional(),
  references: z.array(referenceSchema.partial()).optional(),
  skillGroups: z.array(skillGroupSchema).max(MAX_SKILL_GROUPS).optional(),
  links: z.array(profileLinkSchema.partial()).optional(),
});

export type TResumeContent = z.infer<typeof resumeExtractionSchema>;

export const profileApplySchema = z.object({
  activities: z
    .array(
      activitySchema
        .extend({ endDate: dateOrNull, startDate: dateOrNull })
        .partial()
    )
    .optional(),
  education: z
    .array(
      educationSchema
        .extend({ endDate: dateOrNull, startDate: dateOrNull })
        .partial()
    )
    .optional(),
  links: z.array(profileLinkSchema.partial()).optional(),
  personal: personalSchema.extend({ phone: z.string().nullish() }).partial(),
  preferences: preferencesSchema.partial().optional(),
  professional: professionalSchema.partial(),
  projects: z.array(projectSchema.partial()).optional(),
  publications: z.array(publicationSchema.partial()).optional(),
  references: z.array(referenceSchema.partial()).optional(),
  workExperience: z
    .array(
      workExperienceSchema
        .extend({ endDate: dateOrNull, startDate: dateOrNull })
        .partial()
    )
    .optional(),
});

export const resumeFormSchema = profileFormSchema
  .omit({
    preferences: true,
    professional: true,
    projects: true,
  })
  .extend({
    professional: resumeProfessionalSchema,
    projects: z.array(resumeProjectSchema),
    skillGroups: z.array(skillGroupFormSchema).max(MAX_SKILL_GROUPS).optional(),
  });

export type TResumeFormData = z.input<typeof resumeFormSchema>;

export const EMPTY_FORM: TResumeFormData = {
  activities: [],
  education: [],
  links: [],
  personal: { email: "", firstName: "", lastName: "" },
  professional: {
    title: "",
  },
  projects: [],
  publications: [],
  references: [],
  skillGroups: [],
  workExperience: [],
};

const pickDefined = <T extends object>(value?: T | null): Partial<T> => {
  if (!value || typeof value !== "object") {
    return {};
  }
  const result: Partial<T> = {};
  for (const [key, entry] of Object.entries(value) as [keyof T, T[keyof T]][]) {
    if (
      entry !== undefined &&
      entry !== null &&
      entry !== "" &&
      !(Array.isArray(entry) && entry.length === 0)
    ) {
      result[key] = entry;
    }
  }
  return result;
};

interface TDateEntry {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  isCurrent?: boolean;
}

const toDate = (value: Date | string | null | undefined): Date | undefined =>
  value instanceof Date ? value : stringToDate(value);

const normalizeEntries = <T extends TDateEntry>(
  entries: readonly T[] | undefined
): T[] =>
  (entries ?? []).map((entry) => ({
    ...entry,
    endDate: toDate(entry.endDate),
    isCurrent: entry.isCurrent ?? false,
    startDate: toDate(entry.startDate),
  }));

export const mergeIntoFormData = (
  extraction?: TResumeContent | null,
  base: TResumeFormData = EMPTY_FORM
): TResumeFormData =>
  extraction
    ? ({
        ...base,
        personal: { ...base.personal, ...pickDefined(extraction.personal) },
        professional: {
          ...base.professional,
          ...pickDefined(extraction.professional),
        },
        workExperience: normalizeEntries(extraction.workExperience),
        education: normalizeEntries(extraction.education),
        links: extraction.links?.length ? extraction.links : base.links,
        publications: extraction.publications?.length
          ? extraction.publications
          : base.publications,
        projects: extraction.projects?.length
          ? extraction.projects
          : base.projects,
        references: extraction.references?.length
          ? extraction.references
          : base.references,
        activities: normalizeEntries(extraction.activities),
        skillGroups: extraction.skillGroups?.length
          ? extraction.skillGroups
          : base.skillGroups,
      } as TResumeFormData)
    : base;

export interface IExtractedProjectLookup {
  id?: number;
  name?: string;
  skills: string[];
}

export interface IExtractedLookupEntries {
  industries: string[];
  professional: string[];
  projects: IExtractedProjectLookup[];
}

export interface ILookupNameIdMaps {
  industries: ReadonlyMap<string, number>;
  topics: ReadonlyMap<string, number>;
}

const splitLookupEntries = (value?: string | string[] | null): string[] => {
  const entries = Array.isArray(value) ? value : (value ?? "").split(",");
  return entries
    .flatMap((entry) => (typeof entry === "string" ? entry.split(",") : []))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && entry.length <= MAX_TINY_LENGTH);
};

export const collectExtractedLookupNames = (
  content?: TResumeContent | null
): IExtractedLookupEntries => {
  if (!content) {
    return { industries: [], professional: [], projects: [] };
  }

  const professional = content.professional ?? {};
  const groupKeywords = (content.skillGroups ?? []).flatMap((group) =>
    splitLookupEntries(group.keywords)
  );

  return {
    industries: [...new Set(splitLookupEntries(professional.industries))],
    professional: [
      ...new Set([
        ...splitLookupEntries(professional.skills),
        ...groupKeywords,
      ]),
    ],
    projects: (content.projects ?? []).map((project) => ({
      id: project.id,
      name: project.name,
      skills: splitLookupEntries(project.skills),
    })),
  };
};

const projectKeys = (project: { id?: number; name?: string }): string[] => [
  ...(project.id === undefined ? [] : [`id:${project.id}`]),
  ...(project.name?.trim()
    ? [`name:${normalizeLookupName(project.name)}`]
    : []),
];

const resolveIds = (
  names: string[],
  idsByName: ReadonlyMap<string, number>
): number[] => [
  ...new Set(
    names
      .map((name) => idsByName.get(normalizeLookupName(name)))
      .filter((id): id is number => id !== undefined)
  ),
];

const mergeIds = (
  existing: readonly unknown[] | undefined,
  added: number[]
): number[] => [
  ...new Set([
    ...(existing ?? []).filter((id): id is number => typeof id === "number"),
    ...added,
  ]),
];

export const applyExtractedLookupIds = (
  data: TProfileFormData,
  entries: IExtractedLookupEntries,
  idsByName: ILookupNameIdMaps
): TProfileFormData => {
  const projectSkills = new Map<string, string[]>();
  for (const project of entries.projects) {
    for (const key of projectKeys(project)) {
      projectSkills.set(key, [
        ...new Set([...(projectSkills.get(key) ?? []), ...project.skills]),
      ]);
    }
  }

  const skills = resolveIds(entries.professional, idsByName.topics);
  const industries = resolveIds(entries.industries, idsByName.industries);

  return {
    ...data,
    professional: {
      ...data.professional,
      industries: mergeIds(data.professional?.industries, industries),
      skills: mergeIds(data.professional?.skills, skills),
    },
    projects: (data.projects ?? []).map((project) => {
      const names = projectKeys(project).flatMap(
        (key) => projectSkills.get(key) ?? []
      );
      const projectIds = resolveIds(names, idsByName.topics);
      return {
        ...project,
        skills: mergeIds(project.skills, projectIds),
      };
    }),
  };
};
