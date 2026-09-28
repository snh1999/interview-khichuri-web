import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const LEADERSHIP_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "leadership-style",
    category: "leadership",
    questions: [
      "How would you describe your leadership style?",
      "What kind of leader are you?",
      "How do you set direction for a team?",
      "What principles guide how you lead?",
    ],
    suggestions: "Describe behaviors rather than labels. Explain how you set direction, make decisions, and adapt to different situations and people.",
  },
  {
    id: "decision-making-leader",
    category: "leadership",
    questions: [
      "Tell me about a difficult decision you made as a leader.",
      "Describe a tough leadership decision.",
      "When have you had to make a decision that affected others?",
      "How do you make difficult decisions for a team?",
    ],
    suggestions: "Explain the information, constraints, stakeholders, alternatives, and consequences you considered. Be clear about what you personally decided and why.",
  },
];
