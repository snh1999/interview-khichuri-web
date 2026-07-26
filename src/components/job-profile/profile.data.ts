import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";

export type TTabKey =
  | "personal"
  | "professional"
  | "experience"
  | "education"
  | "preferences"
  | "links";
export const REQUIRED_FIELDS: {
  label: string;
  tab: TTabKey;
  isFilled: (data: TProfileFormData) => boolean;
}[] = [
  {
    label: "FIRST NAME",
    tab: "personal",
    isFilled: (data) => Boolean(data.personal.firstName),
  },
  {
    label: "LAST NAME",
    tab: "personal",
    isFilled: (data) => Boolean(data.personal.lastName),
  },
  {
    label: "EMAIL",
    tab: "personal",
    isFilled: (data) => Boolean(data.personal.email),
  },
  {
    label: "PHONE",
    tab: "personal",
    isFilled: (data) => Boolean(data.personal.phone),
  },
  {
    label: "TITLE",
    tab: "professional",
    isFilled: (data) => Boolean(data.professional.title),
  },
  {
    label: "LEVEL",
    tab: "professional",
    isFilled: (data) => Boolean(data.professional.experienceLevel),
  },
  {
    label: "EXPERIENCE",
    tab: "professional",
    isFilled: (data) => (data.professional.yearsOfExperience ?? -1) >= 0,
  },
  {
    label: "SKILLS",
    tab: "professional",
    isFilled: (data) => (data.professional.skills ?? []).length > 0,
  },
  {
    label: "EDUCATION",
    tab: "education",
    isFilled: (data) => data.education.length > 0,
  },
  {
    label: "LINKS",
    tab: "links",
    isFilled: (data) => data.links.length > 1,
  },
] as const;
export const EXPERIENCE_LEVELS = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
] as const;

export const REMOTE_PREFERENCES = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export const DEGREES = [
  { value: "high_school", label: "High School" },
  { value: "associate", label: "Associate" },
  { value: "bachelor", label: "Bachelor's" },
  { value: "master", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
] as const;

export const COVER_LETTER_TONES = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Enthusiastic" },
] as const;

export const CURRENCIES = [
  { value: "BDT", label: "BDT (৳)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "BDT", label: "BDT (৳)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
] as const;

export const ISO_COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "BD", label: "Bangladesh" },
  { value: "IN", label: "India" },
  { value: "NL", label: "Netherlands" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "UAE" },
] as const;
