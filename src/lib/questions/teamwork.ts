import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const TEAMWORK_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "team-success",
    category: "teamwork",
    questions: [
      "What makes a team successful?",
      "What are the characteristics of a good team?",
      "What do effective teams do differently?",
      "What does good teamwork mean to you?",
    ],
    suggestions:
      "Discuss concrete behaviors such as shared goals, clear ownership, communication, trust, constructive disagreement, and accountability.",
  },
  {
    id: "team-failure",
    category: "teamwork",
    questions: [
      "Tell me about a team that didn't work well.",
      "Describe a team experience that went badly.",
      "What caused a team project to struggle?",
      "Tell me about a difficult team dynamic.",
    ],
    suggestions:
      "Avoid blaming individuals. Explain the underlying dynamic, your contribution to improving it, and what you learned about effective teamwork.",
  },
  {
    id: "collaboration-tools",
    category: "teamwork",
    questions: [
      "How do you keep teammates aligned?",
      "How do you coordinate work with others?",
      "How do you make sure everyone knows what is happening?",
      "How do you manage collaboration across a team?",
    ],
    suggestions:
      "Describe concrete practices for visibility, decisions, ownership, status, and escalation. Adapt the answer to the team's size and working style.",
  },
];
