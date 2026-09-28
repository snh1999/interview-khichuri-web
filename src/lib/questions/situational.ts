import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const SITUATIONAL_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "resisted-idea",
    category: "situational",
    questions: [
      "What would you do if your team resisted your idea?",
      "How would you handle a proposal your team did not want to pursue?",
      "What would you do if your team rejected your recommendation?",
      "How would you respond if senior stakeholders blocked your plan?",
    ],
    suggestions: "Start by understanding the reasons for resistance. Use evidence and discussion to test the idea, adapt where warranted, and commit fully once a decision is made — even when it isn't your proposal.",
  },
  {
    id: "missed-deadline",
    category: "situational",
    questions: [
      "What would you do if you realized you were going to miss a deadline?",
      "How would you handle a deadline you could no longer meet?",
      "What would you do if a project were falling behind schedule?",
      "How would you respond if you couldn't deliver on time?",
    ],
    suggestions: "Raise the risk early, identify the cause and remaining work, propose options, and renegotiate scope or timing when necessary. Do not wait until the deadline has passed.",
  },
  {
    id: "mistake-before-launch",
    category: "situational",
    questions: [
      "What would you do if you found a major mistake just before a deadline?",
      "How would you handle discovering an error at the last minute?",
      "What if you found a serious problem shortly before delivery?",
      "What would you do if fixing a mistake meant missing the deadline?",
    ],
    suggestions: "Assess severity and consequences first. Communicate immediately, contain the risk, and choose between fixing, reducing scope, delaying, or proceeding based on impact rather than panic.",
  },
  {
    id: "changing-goals",
    category: "situational",
    questions: [
      "What would you do if project goals changed near the end?",
      "How would you handle a sudden change in requirements?",
      "What if your priorities changed halfway through a project?",
      "How would you respond to a last-minute change in direction?",
    ],
    suggestions: "Clarify the new objective, identify what work remains useful, assess the cost of the change, and realign scope and expectations.",
  },
  {
    id: "angry-customer",
    category: "situational",
    questions: [
      "How would you handle an angry customer?",
      "What would you do if a customer became upset with you?",
      "How would you respond to an irate client?",
      "How would you deal with a customer who blamed you for a problem?",
    ],
    suggestions: "Listen without escalating, clarify the actual issue, acknowledge the impact without making unsupported promises, and explain the next concrete step.",
  },
  {
    id: "manager-unreasonable",
    category: "situational",
    questions: [
      "What would you do if your manager gave you an unreasonable deadline?",
      "How would you respond to an unrealistic request from your manager?",
      "What if your manager expected more work than could reasonably be completed?",
      "How would you handle an impossible deadline?",
    ],
    suggestions: "Clarify the objective and constraints, estimate the work, explain the tradeoffs, and offer options such as reduced scope, additional resources, or a revised deadline.",
  },
  {
    id: "colleague-not-contributing",
    category: "situational",
    questions: [
      "What would you do if a teammate wasn't contributing?",
      "How would you handle a colleague who repeatedly missed their responsibilities?",
      "What if someone on your team wasn't doing their share?",
      "How would you respond to an underperforming teammate?",
    ],
    suggestions: "Start with direct, respectful communication and clarify expectations. Offer help where appropriate, then involve the relevant manager or process if the issue persists.",
  },
  {
    id: "unclear-task",
    category: "situational",
    questions: [
      "What would you do if you were given an unclear assignment?",
      "How would you approach an ambiguous task?",
      "What if your manager gave you a vague request?",
      "How would you proceed if you didn't know what success looked like?",
    ],
    suggestions: "Identify the missing decisions, ask targeted questions, propose a reasonable interpretation, and confirm priorities before investing heavily in the work.",
  },
  {
    id: "new-team",
    category: "situational",
    questions: [
      "What would you do if you joined a team with unfamiliar processes?",
      "How would you approach your first weeks on a new team?",
      "What if nobody explained how the team works?",
      "How would you get up to speed in an unfamiliar environment?",
    ],
    suggestions: "Observe first, learn the team's goals and norms, review available documentation, ask focused questions, and look for a small useful contribution while building context.",
  },
  {
    id: "conflicting-instructions",
    category: "situational",
    questions: [
      "What would you do if two managers gave you conflicting instructions?",
      "How would you handle conflicting priorities from different stakeholders?",
      "What if two people asked you to do incompatible things?",
      "How would you resolve competing requests from leaders?",
    ],
    suggestions: "Clarify the underlying goals and urgency, make the conflict visible, and ask the relevant stakeholders to agree on priority rather than silently choosing one.",
  },
  {
    id: "ethical-request",
    category: "situational",
    questions: [
      "What would you do if a manager asked you to do something you believed was unethical?",
      "How would you respond to an inappropriate request?",
      "What if you were asked to break a rule to get results?",
      "How would you handle an ethical concern involving a manager?",
    ],
    suggestions: "Clarify the request and applicable policy or law, refuse inappropriate actions, document or escalate through appropriate channels when necessary, and protect relevant people or information.",
  },
  {
    id: "negative-feedback",
    category: "situational",
    questions: [
      "What would you do if your manager gave you harsh criticism?",
      "How would you respond to very negative feedback?",
      "What if you strongly disagreed with feedback you received?",
      "How would you handle criticism you felt was unfair?",
    ],
    suggestions: "Listen and separate tone from substance. Ask for specific examples, consider what is actionable, respond professionally, and seek clarification or escalation only when necessary.",
  },
  {
    id: "low-motivation-team",
    category: "situational",
    questions: [
      "What would you do if your team was losing motivation?",
      "How would you respond to a disengaged team?",
      "What if your teammates seemed burned out or uninterested?",
      "How would you help a team regain momentum?",
    ],
    suggestions: "First understand the cause rather than assuming motivation is the problem. Address workload, clarity, obstacles, recognition, or other concrete causes and involve leadership when needed.",
  },
  {
    id: "new-priority",
    category: "situational",
    questions: [
      "What would you do if your highest-priority task suddenly changed?",
      "How would you handle a sudden reprioritization?",
      "What if your manager's new priority conflicted with a commitment you made to someone else?",
      "How would you react to an urgent new task?",
    ],
    suggestions: "Clarify why the priority changed, identify what can safely pause, communicate the impact on existing commitments, and update the plan.",
  },
  {
    id: "no-experience",
    category: "situational",
    questions: [
      "What would you do if you were assigned something you'd never done before?",
      "How would you approach an unfamiliar task?",
      "What if you didn't have the skills needed for an assignment?",
      "How would you handle a task outside your experience?",
    ],
    suggestions: "Break the problem down, identify the knowledge gap, research or seek guidance, validate your approach early, and communicate risks rather than pretending to know what you don't.",
  },
  {
    id: "project-failure",
    category: "situational",
    questions: [
      "What would you do if a project you led was failing?",
      "How would you respond if a project went seriously off track?",
      "What if you realized your plan wasn't working?",
      "How would you recover a failing project?",
    ],
    suggestions: "Stop and diagnose rather than doubling down automatically. Identify root causes, stabilize the highest risks, communicate the situation, and revise scope, resources, or approach.",
  },
  {
    id: "team-disagreement",
    category: "situational",
    questions: [
      "What would you do if two teammates couldn't agree?",
      "How would you handle a disagreement between team members?",
      "What if two colleagues were in conflict and it affected the work?",
      "How would you help resolve a team dispute?",
    ],
    suggestions: "Understand each position separately, bring the discussion back to shared objectives and evidence, and establish a decision or escalation path.",
  },
  {
    id: "customer-request-impossible",
    category: "situational",
    questions: [
      "What would you do if a customer asked for something you couldn't provide?",
      "How would you handle an impossible customer request?",
      "What if a customer demanded an unrealistic solution?",
      "How would you respond when you can't give a customer what they want?",
    ],
    suggestions: "Clarify the underlying need, explain constraints honestly, and offer viable alternatives or escalation paths instead of making promises you cannot keep.",
  },
  {
    id: "priority-vs-quality",
    category: "situational",
    questions: [
      "What would you do if you had to choose between quality and speed?",
      "How would you handle a situation where there isn't enough time to do everything perfectly?",
      "What if the deadline forced you to reduce quality?",
      "How would you decide what quality level is acceptable under pressure?",
    ],
    suggestions: "Identify the risks of each tradeoff and determine the minimum acceptable quality based on consequences. Make the tradeoff explicit to stakeholders.",
  },
];
