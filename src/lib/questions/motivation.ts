import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const MOTIVATION_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "why-field",
    category: "motivation",
    questions: [
      "Why did you choose this field?",
      "What attracted you to this profession?",
      "Why did you decide to pursue this career?",
      "What made you choose this line of work?",
    ],
    suggestions:
      "Explain the experiences or considerations that led to the choice. Acknowledge if the path evolved rather than forcing a perfectly planned origin story.",
  },
  {
    id: "meaningful-work",
    category: "motivation",
    questions: [
      "What makes work meaningful to you?",
      "What do you find rewarding about your work?",
      "What kind of impact matters to you?",
      "What makes you feel your work is worthwhile?",
    ],
    suggestions:
      "Identify genuine sources of meaning such as solving problems, helping customers, building useful things, learning, or enabling others, and support them with experience.",
  },
];
