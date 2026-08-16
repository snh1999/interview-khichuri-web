import { z } from "zod";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import {
  activitySchema,
  educationSchema,
  personalSchema,
  preferencesSchema,
  professionalSchema,
  profileLinkSchema,
  projectSchema,
  publicationSchema,
  referenceSchema,
  workExperienceSchema,
} from "@/components/job-profile/profile.helpers.ts";
import { stringToDate } from "@/lib/utils.ts";

const dateOrNull = z.coerce.date().nullish();

export const resumeExtractionSchema = z.object({
  personal: personalSchema.extend({ phone: z.string().nullish() }).partial(),
  professional: professionalSchema.partial(),
  preferences: preferencesSchema.partial(),
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
  projects: z.array(projectSchema.partial()).optional(),
  publications: z.array(publicationSchema.partial()).optional(),
  references: z.array(referenceSchema.partial()).optional(),
  links: z.array(profileLinkSchema.partial()).optional(),
});

export type TResumeContent = z.infer<typeof resumeExtractionSchema>;

export const EMPTY_FORM: TProfileFormData = {
  activities: [],
  education: [],
  links: [],
  personal: { email: "", firstName: "", lastName: "" },
  preferences: {},
  professional: {
    industries: [],
    industriesNames: [],
    skillNames: [],
    skills: [],
    title: "",
  },
  projects: [],
  publications: [],
  references: [],
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
  base: TProfileFormData = EMPTY_FORM
): TProfileFormData =>
  extraction
    ? ({
        ...base,
        personal: { ...base.personal, ...pickDefined(extraction.personal) },
        professional: {
          ...base.professional,
          ...pickDefined(extraction.professional),
        },
        preferences: {
          ...base.preferences,
          ...pickDefined(extraction.preferences),
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
      } as TProfileFormData)
    : base;
