import { BEHAVIORAL_QUESTION_BANK } from "./behavioral.ts";
import { GENERAL_QUESTION_BANK } from "./general.ts";
import { SYSTEM_DESIGN_QUESTION_BANK } from "./system-design.ts";
import { TECHNICAL_QUESTION_BANK } from "./technical.ts";

export const QUESTION_BANK_CATEGORIES = [
  "behavioral",
  "technical",
  "systemDesign",
  "general",
] as const;

export type TQuestionBankCategory = (typeof QUESTION_BANK_CATEGORIES)[number];

export const QUESTION_BANK_CATEGORY_LABELS: Record<
  TQuestionBankCategory,
  string
> = {
  behavioral: "Behavioral",
  general: "General",
  systemDesign: "System Design",
  technical: "Technical",
};

export interface IQuestionBankItem {
  id: string;
  category: TQuestionBankCategory;
  questions: string[];
  suggestions: string;
}

export const QUESTION_BANK: IQuestionBankItem[] = [
  ...BEHAVIORAL_QUESTION_BANK,
  ...TECHNICAL_QUESTION_BANK,
  ...SYSTEM_DESIGN_QUESTION_BANK,
  ...GENERAL_QUESTION_BANK,
];

export const getQuestionBankItem = (
  id?: string | null
): IQuestionBankItem | undefined =>
  QUESTION_BANK.find((item) => item.id === id);
