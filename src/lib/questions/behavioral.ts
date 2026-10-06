import type { IQuestionBankItem } from "@/lib/questions/question-bank.ts";

export const BEHAVIORAL_QUESTION_BANK: IQuestionBankItem[] = [
  {
    id: "tell-me-about-yourself",
    category: "behavioral",
    questions: [
      "Tell me about yourself.",
      "Walk me through your background.",
      "Can you introduce yourself?",
      "Give me a brief summary of who you are and what you do.",
    ],
    suggestions:
      "This is usually the opening question and sets the tone for the interview. Recruiters want a concise, structured summary that ties your past, present, and future into one story: where you started, what you do now, and why this role is the next step. Keep it to 60-90 seconds, lead with your most relevant experience, and end by connecting your goals to the position you are applying for.",
  },
  {
    id: "proudest-accomplishment",
    category: "behavioral",
    questions: [
      "What accomplishment are you most proud of?",
      "Tell me about an achievement you're particularly proud of.",
      "Which project or piece of work best represents what you can do?",
      "What was your biggest professional milestone?",
    ],
    suggestions:
      "Choose a specific accomplishment with a clear challenge, your personal contribution, and a meaningful result. Explain why it mattered and what it enabled afterward, and focus on what you actually did rather than describing the team's work broadly.",
  },
  {
    id: "difficult-challenge",
    category: "behavioral",
    questions: [
      "Tell me about a difficult challenge you faced at work.",
      "Describe the most challenging situation you've dealt with.",
      "What was one of the hardest problems you had to solve?",
      "Tell me about a particularly challenging experience.",
    ],
    suggestions:
      "Pick a situation that required judgment or persistence. Explain the context, what made it difficult, the actions you took, and what happened afterward.",
  },
  {
    id: "major-mistake",
    category: "behavioral",
    questions: [
      "Tell me about a mistake you made.",
      "Describe a significant mistake you've made at work.",
      "Tell me about a time something went wrong because of you.",
      "What is a mistake you learned from?",
    ],
    suggestions:
      "Use a real but appropriately chosen example. Take responsibility without overexplaining, describe how you corrected it, and emphasize what you changed afterward to prevent repetition.",
  },
  {
    id: "failure",
    category: "behavioral",
    questions: [
      "Tell me about a time you failed.",
      "Tell me about a failure that affected other people on your team.",
      "Tell me about something you tried that didn't work.",
      "What is a professional failure you've experienced?",
    ],
    suggestions:
      "Choose a genuine setback where you had meaningful responsibility. Explain what happened, what you learned, and how the experience changed your subsequent behavior.",
  },
  {
    id: "learned-from-failure",
    category: "behavioral",
    questions: [
      "What have you learned from a failure?",
      "Tell me about a failure that changed how you work.",
      "What did a difficult failure teach you?",
      "How has a past mistake affected your approach?",
    ],
    suggestions:
      "Focus less on the failure itself and more on the concrete change that followed. Show that the lesson affected later decisions or behavior.",
  },
  {
    id: "went-above-and-beyond",
    category: "behavioral",
    questions: [
      "Tell me about a time you went above and beyond.",
      "Describe a time you exceeded expectations.",
      "When have you done more than what was required?",
      "Give me an example of going the extra mile.",
    ],
    suggestions:
      "Use an example where the extra effort had a clear reason and useful outcome. Avoid portraying unsustainable overwork as the achievement.",
  },
  {
    id: "initiative",
    category: "behavioral",
    questions: [
      "Tell me about a time you took initiative.",
      "Describe something you started without being asked.",
      "When have you proactively solved a problem?",
      "Give me an example of taking ownership without being told.",
    ],
    suggestions:
      "Choose an example where you noticed an opportunity or problem and acted before being directed. Explain your reasoning and the outcome.",
  },
  {
    id: "limited-resources",
    category: "behavioral",
    questions: [
      "Tell me about a time you had limited resources.",
      "Describe a situation where you had to accomplish something with very little support.",
      "When did you have to do more with less?",
      "Tell me about a time resources were constrained.",
    ],
    suggestions:
      "Explain the constraint, the tradeoffs you made, and how you prioritized. Show practical resourcefulness rather than simply saying you worked harder.",
  },
  {
    id: "competing-deadlines",
    category: "behavioral",
    questions: [
      "Tell me about a time you had competing deadlines.",
      "How have you handled multiple urgent priorities?",
      "Describe a time when several things needed to be done at once.",
      "Tell me about a period when you had too many priorities.",
    ],
    suggestions:
      "Explain how you assessed urgency and impact, communicated tradeoffs, and decided what to do first. Include the result and what you would repeat.",
  },
  {
    id: "tight-deadline",
    category: "behavioral",
    questions: [
      "Tell me about a time you worked under a tight deadline.",
      "Describe a project you had to complete under significant time pressure.",
      "How did you handle a very short deadline?",
      "Give me an example of delivering under pressure.",
    ],
    suggestions:
      "Describe how you scoped the work, prioritized essentials, managed risks, and communicated expectations. Make the result concrete.",
  },
  {
    id: "pressure",
    category: "behavioral",
    questions: [
      "How do you handle pressure?",
      "Tell me about a time you were under a lot of pressure.",
      "Describe a high-pressure situation you handled.",
      "What do you do when work becomes overwhelming?",
    ],
    suggestions:
      "Use a real example rather than only listing coping techniques. Explain how you prioritized, communicated, and maintained quality or judgment.",
  },
  {
    id: "conflict-coworker",
    category: "behavioral",
    questions: [
      "Tell me about a conflict with a coworker.",
      "Describe a disagreement you had with a colleague.",
      "Tell me about a time you and a teammate disagreed.",
      "How have you handled conflict with a coworker?",
    ],
    suggestions:
      "Choose a real disagreement and explain both perspectives fairly. Focus on how you communicated, resolved the issue, and preserved the working relationship.",
  },
  {
    id: "disagreement-manager",
    category: "behavioral",
    questions: [
      "Tell me about a time you disagreed with your manager.",
      "Describe a situation where you disagreed with your boss.",
      "Have you ever challenged a manager's decision?",
      "Tell me about a time you had a different opinion from your manager.",
    ],
    suggestions:
      "Show respectful disagreement and good judgment. Explain how you raised your concern, listened to the response, and supported the final decision when appropriate.",
  },
  {
    id: "difficult-manager",
    category: "behavioral",
    questions: [
      "Tell me about a difficult manager you've worked with.",
      "Describe a challenging relationship with a manager.",
      "Have you ever had a manager whose style was difficult for you?",
      "How did you handle a difficult boss?",
    ],
    suggestions:
      "Keep the description professional and avoid attacking the person. Focus on how you adapted your communication and work style and what you learned.",
  },
  {
    id: "difficult-coworker",
    category: "behavioral",
    questions: [
      "Tell me about a difficult coworker.",
      "Describe a challenging colleague relationship.",
      "How did you work with someone you didn't get along with?",
      "Tell me about a teammate who was difficult to work with.",
    ],
    suggestions:
      "Describe observable behavior rather than labels. Explain what you did to keep the work productive and what the outcome was.",
  },
  {
    id: "poor-performer",
    category: "behavioral",
    questions: [
      "Tell me about a time someone on your team wasn't pulling their weight.",
      "Tell me about a time you had to raise concerns about a teammate's performance.",
      "Describe a situation where a colleague wasn't meeting expectations.",
      "Tell me about a time you had to hold someone accountable for their work.",
    ],
    suggestions:
      "Explain how you first clarified expectations and tried to understand the issue. Escalate only when appropriate, and distinguish support from accountability.",
  },
  {
    id: "feedback-given",
    category: "behavioral",
    questions: [
      "Tell me about a time you gave difficult feedback.",
      "Describe a situation where you had to give someone constructive criticism.",
      "Have you ever had to tell someone their work needed improvement?",
      "How do you give difficult feedback?",
    ],
    suggestions:
      "Choose an example showing respect and specificity. Explain how you focused on behavior or outcomes, discussed next steps, and followed up.",
  },
  {
    id: "feedback-received",
    category: "behavioral",
    questions: [
      "Tell me about a time you received difficult feedback.",
      "Describe criticism you received and how you handled it.",
      "What is some tough feedback you've received?",
      "Tell me about a time someone pointed out a weakness in your work.",
    ],
    suggestions:
      "Choose feedback that led to a meaningful improvement. Show that you listened, evaluated it objectively, acted on it, and can explain the resulting change.",
  },
  {
    id: "criticism",
    category: "behavioral",
    questions: [
      "How do you respond to criticism?",
      "Tell me about a time you were criticized.",
      "How do you handle negative feedback?",
      "Describe a time someone disagreed with your work.",
    ],
    suggestions:
      "Use a concrete example where the criticism was useful or difficult. Explain your initial reaction briefly, then focus on how you processed and acted on it.",
  },
  {
    id: "change",
    category: "behavioral",
    questions: [
      "Tell me about a time you had to adapt to change.",
      "Describe a major change you had to deal with at work.",
      "How have you handled an unexpected change in priorities?",
      "Tell me about a time your plans changed suddenly.",
    ],
    suggestions:
      "Explain what changed, what you controlled, how you adjusted, and how you kept others aligned.",
  },
  {
    id: "new-skill",
    category: "behavioral",
    questions: [
      "Tell me about a time you had to learn something new quickly.",
      "Describe a skill you learned for a job.",
      "How have you approached learning a new tool or process?",
      "What have you learned recently, and how have you applied it?",
    ],
    suggestions:
      "Describe how you identified what you needed to learn, how you practiced or sought help, and how you applied the new knowledge.",
  },
  {
    id: "unclear-instructions",
    category: "behavioral",
    questions: [
      "Tell me about a time you received unclear instructions.",
      "What do you do when expectations are ambiguous?",
      "Describe a situation where you weren't sure what was expected.",
      "Tell me about a time you had to work with incomplete information.",
    ],
    suggestions:
      "Explain how you identified the ambiguity, asked targeted questions, made reasonable assumptions where necessary, and communicated those assumptions.",
  },
  {
    id: "independent-work",
    category: "behavioral",
    questions: [
      "Tell me about a time you worked with little supervision.",
      "Describe a situation where you had to work independently.",
      "When have you had to figure something out on your own?",
      "How do you handle work without much guidance?",
    ],
    suggestions:
      "Choose an example showing judgment rather than isolation. Explain how you set direction, checked assumptions, and kept stakeholders informed.",
  },
  {
    id: "asking-for-help",
    category: "behavioral",
    questions: [
      "Tell me about a time you had to ask for help.",
      "When have you realized you couldn't solve something alone?",
      "Describe a time you sought help from a colleague.",
      "How do you know when to ask for help?",
    ],
    suggestions:
      "Show that asking for help was deliberate and timely. Explain what you tried first, what help you requested, and how you used it.",
  },
  {
    id: "helping-others",
    category: "behavioral",
    questions: [
      "Tell me about a time you helped a coworker.",
      "Describe a time you supported a teammate.",
      "When have you gone out of your way to help someone at work?",
      "Tell me about a time you helped someone succeed.",
    ],
    suggestions:
      "Choose an example where your help had a useful outcome. Make clear what you contributed without making the story about being a hero.",
  },
  {
    id: "confidentiality",
    category: "behavioral",
    questions: [
      "Tell me about a time you handled sensitive information.",
      "How have you dealt with confidential information?",
      "Describe a situation where discretion was important.",
      "When have you had to protect sensitive information?",
    ],
    suggestions:
      "Explain the responsibility, the safeguards or judgment you used, and how you balanced confidentiality with the need to communicate.",
  },
  {
    id: "ethical-dilemma",
    category: "behavioral",
    questions: [
      "Tell me about a time you faced an ethical dilemma.",
      "Describe a situation where doing the right thing was difficult.",
      "Have you ever had to speak up about something you thought was wrong?",
      "Tell me about a difficult ethical decision.",
    ],
    suggestions:
      "Choose an example where the competing considerations are clear. Explain how you identified the issue, considered consequences, and acted according to sound principles and relevant rules.",
  },
  {
    id: "customer-problem",
    category: "behavioral",
    questions: [
      "Tell me about a difficult customer you dealt with.",
      "Describe a time you resolved a customer problem.",
      "Tell me about an upset client and how you handled the situation.",
      "How have you dealt with a dissatisfied customer?",
    ],
    suggestions:
      "Focus on listening, clarifying the actual problem, setting realistic expectations, and resolving or escalating appropriately.",
  },
  {
    id: "bad-news",
    category: "behavioral",
    questions: [
      "Tell me about a time you had to deliver bad news.",
      "Describe a situation where you had to tell someone something they didn't want to hear.",
      "How have you communicated disappointing news?",
      "Tell me about a time you had to report a problem to someone more senior.",
    ],
    suggestions:
      "Explain how you prepared, communicated clearly and respectfully, acknowledged the impact, and helped determine next steps.",
  },
  {
    id: "persuasion",
    category: "behavioral",
    questions: [
      "Tell me about a time you persuaded someone.",
      "Describe a time you got someone to change their mind.",
      "When have you had to influence someone who disagreed with you?",
      "Give me an example of persuading a stakeholder.",
    ],
    suggestions:
      "Explain the other person's concern, the evidence or reasoning you used, and how you adapted your communication. Avoid framing persuasion as simply winning an argument.",
  },
  {
    id: "influence-without-authority",
    category: "behavioral",
    questions: [
      "Tell me about a time you influenced people without authority.",
      "How have you gotten others to support an idea when you weren't in charge?",
      "Describe a time you had to influence a peer.",
      "Tell me about a time you led without formal authority.",
    ],
    suggestions:
      "Show how you built alignment through credibility, listening, evidence, and shared goals rather than relying on title or pressure.",
  },
  {
    id: "ownership",
    category: "behavioral",
    questions: [
      "Tell me about a time you took ownership of a problem.",
      "Describe a situation where you were accountable for an outcome.",
      "When have you taken responsibility for something outside your formal duties?",
      "Tell me about a time you owned a problem from start to finish.",
    ],
    suggestions:
      "Choose an example with a clear outcome. Explain what you personally owned, how you coordinated others when needed, and what you learned.",
  },
  {
    id: "organization",
    category: "behavioral",
    questions: [
      "How do you stay organized?",
      "Tell me about a time organization was critical to your success.",
      "How do you keep track of tasks and deadlines?",
      "Describe how you manage a complex workload.",
    ],
    suggestions:
      "Give a concrete example and explain the system or habits you use. Focus on prioritization and visibility rather than naming tools alone.",
  },
  {
    id: "prioritization",
    category: "behavioral",
    questions: [
      "How do you prioritize your work?",
      "Tell me about a time you had to decide what to prioritize.",
      "Describe a difficult prioritization decision.",
      "How do you decide what deserves your attention first?",
    ],
    suggestions:
      "Explain the factors you consider, such as impact, urgency, dependencies, risk, and commitments. Use an example where priorities genuinely competed.",
  },
  {
    id: "detail-vs-speed",
    category: "behavioral",
    questions: [
      "Tell me about a time you had to balance speed and quality.",
      "How do you balance attention to detail with deadlines?",
      "Describe a situation where you couldn't perfect everything.",
      "When is good enough actually good enough?",
    ],
    suggestions:
      "Explain how you identified the acceptable quality bar, managed risk, and made explicit tradeoffs rather than treating speed or perfection as universally correct.",
  },
  {
    id: "process-improvement",
    category: "behavioral",
    questions: [
      "Tell me about a process you improved.",
      "Describe a process you made more efficient.",
      "When have you changed the way work was done?",
      "Give me an example of improving a workflow.",
    ],
    suggestions:
      "Describe the original problem, how you identified the opportunity, what you changed, and the measurable or observable result.",
  },
  {
    id: "innovation",
    category: "behavioral",
    questions: [
      "Tell me about a time you came up with a new idea.",
      "Describe something you improved through a creative approach.",
      "When have you introduced a new way of doing something?",
      "Tell me about an innovative solution you proposed.",
    ],
    suggestions:
      "Explain the problem that motivated the idea and why your approach was different. Include how you tested or validated it.",
  },
  {
    id: "goal-achieved",
    category: "behavioral",
    questions: [
      "Tell me about a goal you achieved.",
      "Describe a goal you set and successfully reached.",
      "What is an important target you have accomplished?",
      "Tell me about a time you exceeded a goal.",
    ],
    suggestions:
      "Choose a goal with a meaningful outcome. Explain how you defined success, what you did, and how you measured the result.",
  },
  {
    id: "goal-missed",
    category: "behavioral",
    questions: [
      "Tell me about a goal you didn't achieve.",
      "Describe a time you fell short of a target.",
      "When have you missed an important goal?",
      "Tell me about a target you failed to meet.",
    ],
    suggestions:
      "Be candid about your responsibility and the reasons for the outcome. Explain what you changed afterward and how you handle similar risks now.",
  },
  {
    id: "achievement-team",
    category: "behavioral",
    questions: [
      "Tell me about a successful team project.",
      "Describe a team achievement you're proud of.",
      "What is the best team you've worked on?",
      "Tell me about a time your team accomplished something significant.",
    ],
    suggestions:
      "Explain the shared goal and your specific contribution. Highlight how the team worked together rather than taking sole credit.",
  },
  {
    id: "cross-functional",
    category: "behavioral",
    questions: [
      "Tell me about a time you worked with people from different teams.",
      "Describe a cross-functional project.",
      "When have you had to collaborate with people with different priorities?",
      "Tell me about a time you worked across departments.",
    ],
    suggestions:
      "Explain the different goals or perspectives involved and how you created alignment, communicated, and handled dependencies.",
  },
  {
    id: "leadership-moment",
    category: "behavioral",
    questions: [
      "Tell me about a time you demonstrated leadership.",
      "Describe a situation where you stepped into a leadership role.",
      "When have you led a team or initiative?",
      "Tell me about a time others looked to you for direction.",
    ],
    suggestions:
      "Leadership can be formal or informal. Focus on the situation, how you created direction or alignment, and the outcome for the group.",
  },
  {
    id: "delegation",
    category: "behavioral",
    questions: [
      "Tell me about a time you delegated work.",
      "How do you decide what to delegate?",
      "How do you give someone ownership of a result?",
      "How do you follow up without micromanaging?",
    ],
    suggestions:
      "Explain how you matched responsibilities to people's skills, capacity, and development needs, set clear outcomes, and checked in without taking the work back.",
  },
  {
    id: "mentoring",
    category: "behavioral",
    questions: [
      "Tell me about a time you mentored someone.",
      "How do you identify development opportunities for teammates?",
      "How do you approach coaching someone?",
      "Tell me about someone you helped grow professionally.",
    ],
    suggestions:
      "Explain how you assessed what the person needed, gave useful responsibility, feedback and support, and followed up to see whether the improvement held.",
  },
  {
    id: "working-style-difference",
    category: "behavioral",
    questions: [
      "Tell me about a time you worked with someone whose style differed from yours.",
      "How have you adapted to a different working style?",
      "Describe a situation where you and a colleague worked very differently.",
      "Tell me about a time you had to adjust your communication style.",
    ],
    suggestions:
      "Focus on adaptation rather than judging the other person. Explain what you changed and how it improved collaboration.",
  },
  {
    id: "setback-recovery",
    category: "behavioral",
    questions: [
      "Tell me about a setback and how you recovered.",
      "Describe a time a project went off track.",
      "What did you do when something important didn't go according to plan?",
      "Tell me about a time you had to recover from a bad situation.",
    ],
    suggestions:
      "Explain how you assessed the situation, stabilized it, communicated clearly, and changed the plan.",
  },
  {
    id: "ambiguous-problem",
    category: "behavioral",
    questions: [
      "Tell me about a time you solved an ambiguous problem.",
      "Describe a problem where you didn't know the right answer at first.",
      "When have you had to make a decision without complete information?",
      "Tell me about a situation with no obvious solution.",
    ],
    suggestions:
      "Explain how you defined the problem, identified assumptions, gathered useful information, considered options, and made a decision.",
  },
  {
    id: "resistance-to-change",
    category: "behavioral",
    questions: [
      "Tell me about a time someone resisted your idea.",
      "Tell me about a time a change you introduced was opposed.",
      "Describe how you responded to pushback from your team.",
      "Tell me about a time an initiative you led was challenged.",
    ],
    suggestions:
      "Explain why people resisted rather than assuming they were simply difficult. Show how you listened, adapted, communicated evidence, or changed the proposal — and what the outcome was.",
  },
  {
    id: "prior-bad-decision",
    category: "behavioral",
    questions: [
      "Tell me about a decision you would make differently today.",
      "Describe a decision you regret.",
      "What professional decision would you change if you could?",
      "Tell me about a time you made the wrong call.",
    ],
    suggestions:
      "Choose a decision where you can articulate what you know now that you didn't know then. Focus on the lesson and the improved decision process.",
  },
  {
    id: "disagreement-team",
    category: "behavioral",
    questions: [
      "Tell me about a time your team disagreed on an approach.",
      "Describe a disagreement within a team.",
      "How did you handle conflicting opinions on a project?",
      "Tell me about a time you helped a team reach agreement.",
    ],
    suggestions:
      "Show how you helped the group distinguish facts, assumptions, preferences, and constraints, then move toward a workable decision.",
  },
  {
    id: "workload",
    category: "behavioral",
    questions: [
      "Tell me about a time your workload became unmanageable.",
      "What do you do when you have too much work?",
      "Describe a period when you were overloaded.",
      "How have you handled an unusually heavy workload?",
    ],
    suggestions:
      "Explain how you surfaced the problem, prioritized, negotiated deadlines or scope, and protected important work.",
  },
  {
    id: "motivation-low",
    category: "behavioral",
    questions: [
      "Tell me about a time you were unmotivated.",
      "How do you handle periods when motivation is low?",
      "Describe a time you had to keep going when you weren't motivated.",
      "What do you do when you lose motivation at work?",
    ],
    suggestions:
      "Choose an example that demonstrates professionalism. Explain how you identified the cause and used structure, priorities, accountability, or support to keep moving.",
  },
  {
    id: "boring-task",
    category: "behavioral",
    questions: [
      "Tell me about a time you had to do repetitive work.",
      "How do you handle tasks you find boring?",
      "Describe a time you had to stay focused on routine work.",
      "How do you maintain quality on repetitive tasks?",
    ],
    suggestions:
      "Show that you can maintain standards even when work is not exciting. Mention useful systems for accuracy, pacing, or improvement.",
  },
  {
    id: "unpopular-decision",
    category: "behavioral",
    questions: [
      "Tell me about a difficult decision that others didn't like.",
      "Describe a time you made an unpopular decision.",
      "When have you had to stand by a difficult decision?",
      "Tell me about a decision that received pushback.",
    ],
    suggestions:
      "Explain the information and constraints behind the decision, how you communicated it, and whether you remained open to evidence that could change your mind.",
  },
  {
    id: "time-you-changed-mind",
    category: "behavioral",
    questions: [
      "Tell me about a time you changed your mind.",
      "Describe a situation where new information changed your opinion.",
      "When have you realized you were wrong?",
      "Tell me about a time you had to reconsider your position.",
    ],
    suggestions:
      "Choose an example where changing course was a strength. Explain what evidence changed your view and what you did differently afterward.",
  },
  {
    id: "best-team-contribution",
    category: "behavioral",
    questions: [
      "What do you usually contribute to a team?",
      "Tell me about the role you tend to play on teams.",
      "What value do you bring to a team?",
      "How would your teammates describe your contribution?",
    ],
    suggestions:
      "Give a specific contribution supported by examples, and show how you adapt when the team needs something different. Avoid generic traits unless you connect them to observable behavior.",
  },
  {
    id: "proud-team-result",
    category: "behavioral",
    questions: [
      "Tell me about something your team accomplished that you couldn't have done alone.",
      "Describe a result that depended heavily on teamwork.",
      "When did collaboration make the biggest difference?",
      "Tell me about a success that was truly a team effort.",
    ],
    suggestions:
      "Emphasize interdependence and your specific role. Explain what each part contributed and why collaboration mattered.",
  },
];
