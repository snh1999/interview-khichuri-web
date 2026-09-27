import {
  AppWindowIcon,
  ArticleIcon,
  CalendarDotsIcon,
  CodeIcon,
  GithubLogoIcon,
  KeyIcon,
  MagnifyingGlassIcon, ReadCvLogoIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TargetIcon,
  TerminalWindowIcon,
  VideoCameraIcon,
  WaveformIcon,
} from "@phosphor-icons/react";

import { LOGIN_PAGE, REGISTER_PAGE } from "@/app.constants.ts";

const REPO_WEB = "https://github.com/snh1999/interview-khichuri-web";
const REPO_API = "https://github.com/snh1999/interview-khichuri-api";

export const NAV_ITEMS = [
  { href: "#features", label: "Features" },
  { href: "#dives", label: "Product tour" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#decisions", label: "Decisions" },
] as const;

export const HERO = {
  badge: "Open source, BYOK, no free-tier AI pool",
  ctaPrimary: { href: REGISTER_PAGE, label: "Start prepping" },
  ctaSecondary: { href: "#dives", label: "Take the tour" },
  headline: ["Your whole job search", "in one workspace"],
  sub: "A resume builder and reviewer, a board of every role you have applied to, a calendar of the dates you are working to — and a mock interview that listens to how you actually answer.",
  trust: ["No shared AI pool", "Keys encrypted at rest", "Open source"],
  image: {
    alt: "Interview Khichuri dashboard showing active jobs, upcoming interviews, and mock interview score progress",
    height: 957,
    src: "/screenshots/1-dashboard.png",
    width: 1860,
  },
} as const;

export const FEATURES = {
  heading: "Why open this tab",
  sub: "Three commitments behind every feature in the application.",
  items: [
    {
      description:
        "The interviewer avatar watches and hears you, waits for you to finish, then asks a sharper follow-up because of how you answered. Audio streams in, scored feedback streams back out.",
      icon: VideoCameraIcon,
      title: "A real interview feel, not a QnA form",
    },
    {
      description:
        "Bring a key from OpenAI or Google and pick the model yourself. The app has no shared inference budget to ration, and no dark patterns built around one.",
      icon: KeyIcon,
      title: "You choose the model and bring your key",
    },
    {
      description:
        "Every role, session, question, and note lives in one workspace with your own account.",
      icon: CodeIcon,
      title: "Built as one free tool",
    },
  ],
} as const;

// Ordered so no two interview-flavoured dives sit next to each other, and job
// tracking lands at 02 — it is one of the three shipped pillars and had no place
// in the tour at all, sitting in the capability band with schedule and settings.
// The 01 -> 06 arc is a balance, not a story: read as a sequence it jumps around,
// and that is the trade for the first two screens no longer being all interview.
export const DEEP_DIVES = [
  {
    description:
      "A live mock with camera preview, a lip-synced avatar, and speech-to-text running over streaming connections. The interviewer stays quiet until you stop talking, then generates the next question from the transcript so far.",
    features: [
      "Camera and microphone preview before you begin",
      "Avatar speaks questions aloud; TTS is streamed",
      "Follow-ups generated from your previous answer",
      "Question flow timed so you are never cut off mid-thought",
    ],
    image: {
      alt: "Live mock interview screen with camera preview, AI avatar, and a running transcript",
      height: 957,
      src: "/screenshots/2-interview.png",
      width: 1860,
    },
    number: "01",
    subtitle: "Live mock interview",
    title: "It waits for you to finish",
  },
  {
    description:
      "Paste a job description and the role, company, and requirements come back structured. Score it against your resume, move it through saved, applied, and scheduled, and keep the salary, remote policy, and deadline attached to the role rather than in a spreadsheet.",
    features: [
      "Role and requirements pulled out of the pasted description",
      "Match score against your resume, with missing skills named",
      "Saved, applied, and scheduled on one board",
    ],
    image: {
      alt: "Job tracking board with saved, applied, and scheduled jobs",
      height: 947,
      src: "/screenshots/6-jobs-grid.png",
      width: 1865,
    },
    number: "02",
    subtitle: "Job tracker",
    title: "Every application, on one board",
  },
  {
    description:
      "Paste a job description and get a review of how well your resume answers it. Keyword coverage and missing skills are reported plainly, with the specific gaps you should close before applying.",
    features: [
      "Keyword coverage against the pasted JD",
      "Missing skills called out explicitly",
      "Section-by-section structure feedback",
      "Suggestions tied to the role, not generic advice",
    ],
    image: {
      alt: "ATS resume review screen comparing a resume against a job description",
      height: 952,
      src: "/screenshots/4-ats-review.png",
      width: 1853,
    },
    number: "03",
    subtitle: "ATS resume review",
    title: "Check the resume against the job",
  },
  {
    description:
      "When the session ends you get a written debrief: overall score, a breakdown by dimension, what you did well, what to fix next, and a summary you can export as PDF or share as a link.",
    features: [
      "Overall score with per-dimension breakdown",
      "Strengths and concrete improvements",
      "Markdown summary export to PDF",
      "Shareable report link",
    ],
    image: {
      alt: "Completed mock interview report with scores, strengths, and improvement notes",
      height: 748,
      src: "/screenshots/3-interview-report.png",
      width: 1579,
    },
    number: "04",
    subtitle: "Scored debrief",
    title: "You leave with a report, not a score",
  },
  {
    description:
      "A block-based editor with live section preview. Build a resume, export a PDF, and publish it to a shareable link when you want someone to open exactly what you see.",
    features: [
      "Block editor with live preview",
      "Reusable templates",
      "Rearrange Sections",
      "One-click PDF export",
      "Public share link per resume",
    ],
    image: {
      alt: "Resume editor with block-based editing and a live document preview",
      height: 952,
      src: "/screenshots/5-resume-editor.png",
      width: 1853,
    },
    number: "05",
    subtitle: "Resume builder",
    title: "Write it once, publish it anywhere",
  },
  {
    description:
      "A question bank organised by category and topic, filtered to the role you are actually targeting. Save a question, write an answer, pin it for review, and reuse it in a later session.",
    features: [
      "Filter by role, experience level, and topic",
      "Draft answers saved per question",
      "Pin the ones you keep getting wrong",
    ],
    image: {
      alt: "Question bank listing interview questions by category and topic",
      height: 496,
      src: "/screenshots/7-question-bank.png",
      width: 1592,
    },
    number: "06",
    subtitle: "Practice and question bank",
    title: "Drill the weak spots",
  },
] as const;

export const CAPABILITY_BAND = {
  heading: "The rest of the workspace",
  sub: "The parts you touch between interviews: when things are due, whether the last month actually improved, and which key is doing the work.",
  items: [
    {
      description:
        "A month calendar for interviews and deadlines, with your own events layered on top of the dates pulled from each job.",
      icon: CalendarDotsIcon,
      image: {
        alt: "Monthly schedule calendar showing interviews, deadlines, and custom events",
        height: 952,
        src: "/screenshots/9-schedule.png",
        width: 1853,
      },
      title: "Schedule",
    },
    {
      description:
        "Every mock you have run, with scores, and a trend line so you can see whether the last month actually improved.",
      icon: WaveformIcon,
      image: {
        alt: "Prep session history with mock interview scores",
        height: 952,
        src: "/screenshots/10-sessions.png",
        width: 1853,
      },
      title: "Session history",
    },
    {
      description:
        "Add a key per provider, pick a model, and see exactly which one is active. Keys are encrypted at rest and never used without you asking.",
      icon: ShieldCheckIcon,
      image: {
        alt: "Settings screen listing API keys per provider with the active one selected",
        height: 778,
        src: "/screenshots/13-keys-settings.png",
        width: 1570,
      },
      title: "Keys and privacy",
    },
  ],
} as const;

export const ROADMAP = {
  heading: "Not built yet",
  sub: "Listed here rather than on the features list, because none of it works end to end yet. Order roughly follows what gets built next.",
  // TODO(snh1999): move items up into FEATURES/DEEP_DIVES as each one ships.
  items: [
    {
      description:
        "Customize and share your prompts. Get pastable prompt for Gemini, Claude, Kimi, Chatgpt and others without API key.",
      icon: ArticleIcon,
      label: "Alpha",
      title: "Prompt Library",
    },
    {
      description:
        "A Portfolio builder from In app Sketch, Inspiration Image and Prompt- all designed and planned by you. Under testing.",
      icon: ReadCvLogoIcon,
      label: "Alpha",
      title: "Portfolio Builder",
    },
    {
      description:
        "The same app as a native install. A large part of the UI is already built, but the packaging is not.",
      icon: AppWindowIcon,
      label: "Next",
      title: "Desktop app",
    },
    {
      description:
        "Paste a job URL and have the role, company, and requirements pulled in for you instead of typed out.",
      icon: MagnifyingGlassIcon,
      label: "Planned",
      title: "Fetch a job from a URL",
    },
    {
      description:
        "Given a company and a role, find relaxant information from available sources so your answers are informed.",
      icon: TargetIcon,
      label: "Planned",
      title: "Company research",
    },
    {
      description:
        "Fetch Jobs from different API sources and Company website. Score every job in your board against your resume and rank them.",
      icon: SparkleIcon,
      label: "Planned",
      title: "Job Board with match scoring",
    },
    {
      description:
        "Clone the stack, run one command, and have a working app. Compose and Postgres config are not packaged for it yet.",
      icon: TerminalWindowIcon,
      label: "Planned",
      title: "One-command self-hosting",
    },
  ],
} as const;

export const DECISIONS = {
  heading: "Decisions worth arguing about",
  sub: "The choices that shaped this, each with the cost that comes attached. If you disagree with one, that is useful to know.",
  items: [
    {
      answer:
        "That is meant as the differentiating factor for this project. YouTube is filled with tutorials around this app idea, but all of them use some paid service one way or the other. I just tried to give this app has its own place, by the pitch that user doesn't have to pay anything. and most insurgent of his job is not in the position to pay for an app like this.",
      question: "Why such free-self contained philosophy?",
    },
    {
      answer:
        "the app will not benefit from server-side rendering in any way, But it was tempting invite as I was considering to use Tauri for desktop application. But when I started there was quite a few Next.js vulnerability in the past and Tanstack start did not even reach version 1. With BYOK setup, user is putting some trust in this system- I wanted to avoid any route that may have caused the user to regret that trust. ",
      question: "Why not use Next.js or any other full-stack framework?",
    },
    {
      answer:
        " Right now the plan is to give a more limited and lighter Tauri version and a electron version with local AI setup. Honestly, I am not sure about this one. The initial plan was to use tauri for a more performant application with minimal bundle size. But as the planning evolved, Some of the cool features will require browser-use or shipping some sort of browser which works against the decision to use Tauri.",
      question: "What is the plan with Desktop app?",
    },
    {
      answer:
        "Postgres when it is hosted, SQLite when it is not. What is shared is one database interface, not the schema — there are two schema trees, two migration sets, and two service implementations behind that one interface. Worth it for a zero-dependency, self contained packaging and install. Arguable either way.",
      question: "Why support two databases?",
    },
    {
      answer:
        "Seven providers, two SDKs, one service. These are the providers I could find with decent free-tier, as I do not have the means to test paid providers and tiers. Google is the odd one out; the other six are OpenAI-compatible and only need a different `baseURL`. The catch is that the abstraction is a config table plus a ternary copied at each call site, not a real interface, and one service has to reach into another to avoid a dependency cycle — there is a comment in the source explaining exactly that. ",
      question: "Why support seven AI providers?",
    },
    {
      answer:
        "Because the product is useless without the user's own key anyway, and the interesting constraint is what happens when two keys are active at once. That invariant is a unique partial index in the database, not a check in application code, so it holds even if two requests race. The cost is on write: adding or activating a key fires a real generation request at the provider to confirm it works, and the text-to-speech cache is process-wide rather than keyed by user — so the permission check has to run before a cache hit is allowed to short-circuit, or a user with no key could replay someone else's audio.",
      question: "Why do keys live in the database, encrypted?",
    },
    {
      answer:
        "SSE, and nothing else — there is not a WebSocket anywhere in the codebase. The generated text streams; the audio does not, it comes back as one request. The part worth arguing about is the envelope. Every response in this API is wrapped in a JSON envelope, which would corrupt a stream, so the two streaming endpoints have to opt out of it by decorator. Envelope consistency is per-route opt-in rather than structural, and the streaming responses are not a shape you would guess from the type.",
      question: "Why SSE instead of WebSockets?",
    },
    {
      answer:
        "The questions generated for a mock never reach the server. The `interviews` table has no column for them — it stores the mode, the scores, and the summary, and that is all. The question set lives in the browser, which is what makes an interrupted interview resumable and keeps a transcript from being persisted server-side by default. It also means the interview cannot be resumed on another device, which is a real cost and not an oversight.",
      question: "Why are interview questions not stored server-side?",
    },
    {
      answer:
        "In SQL, wherever the database can enforce it. A note belongs to a question or to a job, never both, and that is a `CHECK` constraint in the migration rather than a conditional in a service. The same goes for the one-active-key-per-provider rule. The limit is honest: these constraints only exist in the Postgres migrations, so a SQLite install does not get them.",
      question: "Why put invariants in the schema, not in TypeScript?",
    },
    {
      answer:
        "Because the thing being evaluated is untrusted input. The transcript of your own spoken answer, the job description, the resume text, and any company research all get pasted into the same prompt that scores you, and a job description can contain text aimed at the model. Every one of those prompts says, in the prompt itself, to treat the tagged regions as data and never as instructions. It is a soft defence and it is not a security boundary, but it is cheaper than pretending the input is trustworthy.",
      question:
        "Why is the user's own answer/input treated as a prompt-injection risk?",
    },
    {
      answer:
        "Deferred render when the search is in memory, debounce when it is on the network. They are not interchangeable and the reasoning is short: deferring a render cannot cancel a fetch, so anything that leaves the browser has to actually be rate-limited instead. Filtering a local index does not, and paying an artificial delay to avoid React throwing away intermediate renders would be the wrong trade. Worth knowing this one bites anyone who reaches for a debounce hook by default.",
      question: "Why is search sometimes deferred and sometimes debounced?",
    },
  ],
} as const;

export const CTA = {
  heading: "Bring your own key and see how it feels",
  sub: "No card, no shared inference budget, no sales call. Sign up, paste an OpenAI or Google key, and everything above opens against your own account — start wherever the search is stuck.",
  primary: { href: REGISTER_PAGE, label: "Create an account" },
  secondary: { href: LOGIN_PAGE, label: "I already have one" },
} as const;

export const FOOTER = {
  columns: [
    {
      heading: "Product",
      links: [
        { href: "#features", label: "Features" },
        { href: "#dives", label: "Product tour" },
        { href: "#roadmap", label: "Roadmap" },
        { href: "#decisions", label: "Decisions" },
      ],
    },
    {
      heading: "Source",
      links: [
        {
          href: REPO_WEB,
          external: true,
          icon: GithubLogoIcon,
          label: "Web app",
        },
        { href: REPO_API, external: true, icon: GithubLogoIcon, label: "API" },
      ],
    },
    // TODO(snh1999): re-enable once there is a pricing page, a terms page, a
    // privacy policy, and a real contact address to put here. Commented out
    // rather than pointed at dead anchors.
    // {
    //   heading: "Company",
    //   links: [
    //     { href: "/pricing", label: "Pricing" },
    //     { href: "/terms", label: "Terms" },
    //     { href: "/privacy", label: "Privacy" },
    //     { href: "mailto:hello@interviewkhichuri.dev", label: "Contact" },
    //   ],
    // },
  ],
  tagline:
    "One workspace for the resume, the applications, the prep, and the score.",
} as const;

export const SOCIAL_LINKS = [
  { href: REPO_WEB, icon: GithubLogoIcon, label: "Web app source" },
  { href: REPO_API, icon: GithubLogoIcon, label: "API source" },
] as const;
