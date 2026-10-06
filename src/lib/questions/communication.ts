import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const COMMUNICATION_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "explain-complex",
    category: "communication",
    questions: [
      "Tell me about a time you explained something complex to a non-expert.",
      "How do you explain complicated ideas to people unfamiliar with them?",
      "Describe a time you had to simplify technical or complex information.",
      "How do you communicate complex information clearly?",
    ],
    suggestions:
      "Start with the audience's needs and existing knowledge. Use plain language, relevant examples, and check understanding rather than simply reducing terminology.",
  },
  {
    id: "miscommunication",
    category: "communication",
    questions: [
      "Tell me about a time you experienced a miscommunication.",
      "Describe a misunderstanding you had at work.",
      "When has communication gone wrong and how did you fix it?",
      "Tell me about a time your message was misunderstood.",
    ],
    suggestions:
      "Explain what caused the misunderstanding, how you recognized it, what you did to correct it, and what communication practice you changed afterward.",
  },
  {
    id: "written-communication",
    category: "communication",
    questions: [
      "Tell me about a time written communication was important.",
      "How do you make your emails or written messages clear?",
      "Describe a situation where documentation mattered.",
      "How do you communicate effectively in writing?",
    ],
    suggestions:
      "Explain how you tailor structure, detail, tone, and action items to the audience. Give a concrete example where clarity mattered.",
  },
  {
    id: "difficult-conversation",
    category: "communication",
    questions: [
      "Tell me about a difficult conversation you had at work.",
      "Describe a conversation you were reluctant to have.",
      "When have you had to address a sensitive issue directly?",
      "How do you approach difficult conversations?",
    ],
    suggestions:
      "Explain how you prepared, chose the right setting, stated the issue clearly, listened, and worked toward a constructive next step.",
  },
  {
    id: "presentation",
    category: "communication",
    questions: [
      "Tell me about a presentation you gave.",
      "Describe a time you had to present an idea to a group.",
      "How do you prepare for an important presentation?",
      "Tell me about a presentation that didn't go as planned.",
    ],
    suggestions:
      "Focus on audience, objective, preparation, delivery, and outcome. If something went wrong, explain how you adapted.",
  },
];
