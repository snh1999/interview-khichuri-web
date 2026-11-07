import {
  AppWindowIcon,
  BriefcaseIcon,
  GithubLogoIcon,
  KeyIcon,
  LightbulbFilamentIcon,
  MagnifyingGlassIcon,
  ReadCvLogoIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TargetIcon,
  TerminalWindowIcon,
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
    alt: "Interview Khichuri dashboard with job stats, a month calendar, and recent sessions",
    height: 970,
    src: "/screenshots/1-dashboard.png",
    width: 1868,
  },
} as const;

export const FEATURES = {
  heading: "Why open this tab",
  sub: "Three commitments behind every feature in the application.",
  items: [
    {
      description:
        "Discover roles, track every application through eight statuses, and keep each company's open jobs in the same directory — instead of a spreadsheet, five tabs, and a notes app.",
      icon: BriefcaseIcon,
      title: "Track the whole search in one place",
    },
    {
      description:
        "Run the live mock, read the scored debrief, check the resume against the job, and drill weak spots from the question bank — all against the same tracked role.",
      icon: LightbulbFilamentIcon,
      title: "Prep without leaving the tab",
    },
    {
      description:
        "Bring a key from OpenAI, Google, or any OpenAI-compatible provider and pick the model yourself. Keys are encrypted at rest, your data stays in your account, and the code is open source — no shared inference budget or subscription.",
      icon: KeyIcon,
      title: "Your key, your model, your data",
    },
  ],
} as const;

// The order tells the job-search arc: find and track the role,
// look up the company, check the resume, run the mock, read the debrief,
// drill the weak spots, then build the resume and the portfolio.
export const DEEP_DIVES = [
  {
    description:
      "Paste a job description or URL and the role, company, and requirements come back structured. Browse Discover for roles from public sources and track one in a click, then move it through eight statuses from saved to offer or withdrawn — with salary, remote policy, and deadline attached to the role rather than in a spreadsheet.",
    features: [
      "Role and requirements pulled out of a pasted description or URL",
      "Discover public jobs and track one without retyping it",
      "Tracked and Discover tabs on one page",
      "Eight statuses, from saved through offer or withdrawn",
    ],
    image: {
      alt: "Jobs page with tracked and discover tabs, status filters, and a list of applications",
      height: 966,
      src: "/screenshots/6-jobs-grid.png",
      width: 1865,
    },
    number: "01",
    subtitle: "Job tracker",
    title: "Every application, on one board",
  },
  {
    description:
      "Every company you are targeting in one directory, with its open jobs attached. Search the full list, open a company to see what it is hiring for, and request a new one when something is missing.",
    features: [
      "Search every company in one directory",
      "Open a company to see its open jobs",
      "Request a new company when one is missing",
    ],
    image: {
      alt: "Companies directory with search and a list of companies",
      height: 968,
      src: "/screenshots/11-company-page.png",
      width: 1875,
    },
    number: "02",
    subtitle: "Company directory",
    title: "Know who you are applying to",
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
      alt: "ATS resume review comparing a resume against a job description",
      height: 888,
      src: "/screenshots/4-ats-review.png",
      width: 1571,
    },
    number: "03",
    subtitle: "ATS resume review",
    title: "Check the resume against the job",
  },
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
      height: 966,
      src: "/screenshots/2-interview.png",
      width: 1865,
    },
    number: "04",
    subtitle: "Live mock interview",
    title: "It waits for you to finish",
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
    number: "05",
    subtitle: "Scored debrief",
    title: "You leave with a report, not a score",
  },
  {
    description:
      "A question bank organised by category, sitting next to your notes. Search the whole bank, save a question as a note, write your answer, and favorite the ones you want to revisit before the next interview.",
    features: [
      "Search the full bank or filter by category",
      "Turn any question into a note and draft your answer there",
      "Favorite the notes you want to revisit",
    ],
    image: {
      alt: "Question bank with search, category filters, and a note action for each question",
      height: 496,
      src: "/screenshots/7-question-bank.png",
      width: 1592,
    },
    number: "06",
    subtitle: "Notes and question bank",
    title: "Drill the weak spots",
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
    number: "07",
    subtitle: "Resume builder",
    title: "Write it once, publish it anywhere",
  },
  {
    description:
      "A canvas for sketching the portfolio before you build it. Wireframe desktop, tablet, and mobile frames, collect inspiration in a moodboard, then generate a portfolio from the sketch. Still experimental, so expect rough edges.",
    features: [
      "Canvas with desktop, tablet, and mobile frames",
      "Layers, templates, and a component library",
      "Generate a portfolio from the sketch",
    ],
    image: {
      alt: "Portfolio builder canvas with artboard frames, layers, and a mobile preview",
      height: 968,
      src: "/screenshots/9-portfolio-bulider-canvas.png",
      width: 1875,
    },
    number: "08",
    subtitle: "Portfolio builder",
    title: "Sketch it before you build it",
  },
] as const;

export const CAPABILITY_BAND = {
  heading: "The rest of the workspace",
  sub: "The parts you touch between interviews: whether the last month actually improved, and which key is doing the work.",
  items: [
    {
      description:
        "Every prep session you have started, filtered by job and topic, with the mocks you have run attached.",
      icon: WaveformIcon,
      image: {
        alt: "Preparation sessions list with job, topic, and experience filters",
        height: 966,
        src: "/screenshots/10-sessions.png",
        width: 1865,
      },
      title: "Preparation sessions",
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
  heading: "Roadmap",
  sub: "Statuses are honest: beta means deployed but still rough around the edges, alpha means usable but incomplete.",
  // TODO(snh1999): move items up into FEATURES/DEEP_DIVES as each one ships.
  items: [
    {
      description:
        "A canvas for wireframes, moodboards, and inspiration images. Deployed as an experimental beta while the generation flow is still being finished.",
      icon: ReadCvLogoIcon,
      label: "Beta",
      title: "Portfolio Builder",
    },
    {
      description:
        "Paste a job URL and have the role, company, and requirements pulled in for you instead of typed out.",
      icon: MagnifyingGlassIcon,
      label: "Alpha",
      title: "Fetch a job from a URL",
    },
    {
      description:
        "Given a company and a role, find relevant information from available sources so your answers are informed.",
      icon: TargetIcon,
      label: "Alpha",
      title: "Company research",
    },
    {
      description:
        "Fetch jobs from different API sources and company websites. Score every job in your board against your resume and rank them.",
      icon: SparkleIcon,
      label: "Alpha",
      title: "Job Board with match scoring",
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
        "That is the differentiating factor for this project. YouTube is full of tutorials around this same idea, but all of them lean on some paid service one way or another. I wanted this app to have its own place with a simple pitch: the user does not have to pay anything. And most people in the middle of a job search are not in a position to pay for an app like this.",
      question: "Why the free, self-contained philosophy?",
    },
    {
      answer:
        "The app does not benefit from server-side rendering in any way, and the stack was tempting while I was considering Tauri for the desktop application. But there had been quite a few Next.js vulnerabilities in the past, and TanStack Start had not even reached version 1. With a BYOK setup the user is putting real trust in this system, so I wanted to avoid any route that might make them regret that trust.",
      question: "Why not use Next.js or any other full-stack framework?",
    },
    {
      answer:
        "Right now the plan is a lighter, more limited Tauri version and an Electron version with a local AI setup. Honestly, I am not sure about this one. The initial plan was Tauri, for a more performant app with a minimal bundle size. But as planning evolved, some of the features I want need browser automation or a bundled browser, which works against that choice.",
      question: "What is the plan with Desktop app?",
    },
    {
      answer:
        "Postgres when it is hosted, SQLite when it is not. What is shared is one database interface, not the schema — there are two schema trees, two migration sets, and two service implementations behind that one interface. Worth it for a zero-dependency, self contained packaging and install. Arguable either way.",
      question: "Why support two databases?",
    },
    {
      answer:
        "Eight provider options, two SDKs, one service. These are the providers I could find with decent free-tier, as I do not have the means to test paid providers and tiers. Google is the odd one out; the rest speak the OpenAI API and only need a different `baseURL`, or a custom endpoint for anything else. The catch is that the abstraction is a config table plus a ternary copied at each call site, not a real interface, and one service has to reach into another to avoid a dependency cycle — there is a comment in the source explaining exactly that. ",
      question: "Why support eight AI providers?",
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
  sub: "No card, no shared inference budget, no sales call. Sign up, paste a key from OpenAI, Google, or any OpenAI-compatible provider, and everything above opens against your own account — start wherever the search is stuck.",
  primary: { href: REGISTER_PAGE, label: "Start prepping" },
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
