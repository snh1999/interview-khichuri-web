import { generateSafeId } from "@/lib/utils";
import type {
  CanvasElement,
  MoodboardItem,
  Portfolio,
  ThemeConfig,
} from "../types";

export const DEFAULT_THEMES: ThemeConfig[] = [
  {
    id: "dark-luxury-portfolio",
    name: "Indigo & Violet (Light)",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    accentColor: "#10b981",
    backgroundColor: "#ffffff",
    surfaceColor: "#f8fafc",
    textColor: "#0f172a",
    textMutedColor: "#475569",
    fontHeading: "font-sans font-extrabold",
    fontBody: "font-sans",
    borderRadius: "xl",
    styleMood: "luxury",
  },
  {
    id: "editorial-clean",
    name: "Monochrome Minimal (Light)",
    primaryColor: "#18181b",
    secondaryColor: "#3f3f46",
    accentColor: "#2563eb",
    backgroundColor: "#ffffff",
    surfaceColor: "#f8fafc",
    textColor: "#0f172a",
    textMutedColor: "#475569",
    fontHeading: "font-serif font-bold",
    fontBody: "font-sans",
    borderRadius: "md",
    styleMood: "minimal",
  },
  {
    id: "warm-terracotta",
    name: "Warm Terracotta & Sand (Light)",
    primaryColor: "#c2410c",
    secondaryColor: "#d97706",
    accentColor: "#059669",
    backgroundColor: "#faf7f2",
    surfaceColor: "#ffffff",
    textColor: "#292524",
    textMutedColor: "#78716c",
    fontHeading: "font-sans font-bold",
    fontBody: "font-sans",
    borderRadius: "xl",
    styleMood: "playful",
  },
  {
    id: "cyber-dev",
    name: "Emerald & Slate (Dark)",
    primaryColor: "#10b981",
    secondaryColor: "#06b6d4",
    accentColor: "#f59e0b",
    backgroundColor: "#030712",
    surfaceColor: "#111827",
    textColor: "#f3f4f6",
    textMutedColor: "#9ca3af",
    fontHeading: "font-mono font-bold",
    fontBody: "font-mono",
    borderRadius: "sm",
    styleMood: "modern",
  },
  {
    id: "nordic-frost",
    name: "Frost & Steel (Light)",
    primaryColor: "#0284c7",
    secondaryColor: "#6366f1",
    accentColor: "#0d9488",
    backgroundColor: "#f1f5f9",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    textMutedColor: "#475569",
    fontHeading: "font-sans font-bold",
    fontBody: "font-sans",
    borderRadius: "lg",
    styleMood: "modern",
  },
  {
    id: "midnight-amethyst",
    name: "Amethyst & Rose (Dark)",
    primaryColor: "#a855f7",
    secondaryColor: "#ec4899",
    accentColor: "#38bdf8",
    backgroundColor: "#0b0914",
    surfaceColor: "#151226",
    textColor: "#f5f3ff",
    textMutedColor: "#a78bfa",
    fontHeading: "font-sans font-black",
    fontBody: "font-sans",
    borderRadius: "xl",
    styleMood: "luxury",
  },
];

export const INITIAL_SKETCH_ELEMENTS: CanvasElement[] = [
  {
    id: "frame-portfolio-desktop",
    type: "frame",
    name: "Home (Desktop)",
    title: "Home",
    route: "/",
    isHome: true,
    description: "Developer & Designer Portfolio primary landing page",
    preset: "desktop",
    x: 60,
    y: 60,
    width: 1040,
    height: 820,
    strokeColor: "#6366f1",
    fillColor: "#ffffff",
    strokeWidth: 2,
    opacity: 1,
    zIndex: 1,
    background: "#ffffff",
  },
  {
    id: "stamp-nav-1",
    type: "stamp",
    stampType: "navbar",
    name: "Portfolio Navigation",
    label: "{{name}} • Projects • Experience • Stack • Contact [Hire Me]",
    x: 90,
    y: 90,
    width: 980,
    height: 54,
    strokeColor: "#334155",
    fillColor: "#f8fafc",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-desktop",
    zIndex: 2,
  },
  {
    id: "stamp-hero-1",
    type: "stamp",
    stampType: "hero",
    name: "Hero Bio & Statement",
    label: "{{name}} — {{title}}",
    sublabel:
      "Crafting high-impact web apps, AI tools, and scalable design systems with React, TypeScript & Node.js.",
    x: 120,
    y: 165,
    width: 920,
    height: 180,
    strokeColor: "#475569",
    fillColor: "#f1f5f9",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-desktop",
    zIndex: 3,
  },
  {
    id: "stamp-proj-1",
    type: "stamp",
    stampType: "project",
    name: "Project Card: Nova AI",
    label: "Project Atlas — Analytics Dashboard",
    sublabel: "Next.js, TypeScript, Tailwind • Interactive analytics dashboard",
    x: 120,
    y: 365,
    width: 290,
    height: 175,
    strokeColor: "#6366f1",
    fillColor: "#ffffff",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-desktop",
    zIndex: 4,
  },
  {
    id: "stamp-proj-2",
    type: "stamp",
    stampType: "project",
    name: "Project Card: Pulse Analytics",
    label: "Project Beacon — Real-Time Event Platform",
    sublabel: "React, D3.js, WebSockets, Go • Real-time event pipeline",
    x: 435,
    y: 365,
    width: 290,
    height: 175,
    strokeColor: "#6366f1",
    fillColor: "#ffffff",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-desktop",
    zIndex: 5,
  },
  {
    id: "stamp-proj-3",
    type: "stamp",
    stampType: "project",
    name: "Project Card: Vault Mobile",
    label: "Project Nimbus — Mobile Banking Companion",
    sublabel: "React Native, TypeScript, Node.js • Personal finance companion",
    x: 750,
    y: 365,
    width: 290,
    height: 175,
    strokeColor: "#6366f1",
    fillColor: "#ffffff",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-desktop",
    zIndex: 6,
  },
  {
    id: "stamp-skills-1",
    type: "stamp",
    stampType: "skills",
    name: "Tech Stack & Skills",
    label:
      "Core Stack: React, Next.js, TypeScript, Node.js, GraphQL, PostgreSQL, TailwindCSS, Figma",
    sublabel:
      "Architecture: Distributed Systems, AI Engineering, Real-Time WebSockets, Micro-frontends",
    x: 120,
    y: 560,
    width: 450,
    height: 110,
    strokeColor: "#059669",
    fillColor: "#ecfdf5",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-desktop",
    zIndex: 7,
  },
  {
    id: "stamp-exp-1",
    type: "stamp",
    stampType: "experience",
    name: "Work History",
    label:
      "Experience: Lead Product Engineer @ Fintech Co. (2023-Present) • Senior Frontend Engineer @ SaaS Co. (2021-2023)",
    sublabel:
      "Education: B.S. Computer Science & Human-Computer Interaction @ State University",
    x: 590,
    y: 560,
    width: 450,
    height: 110,
    strokeColor: "#d97706",
    fillColor: "#fffbeb",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-desktop",
    zIndex: 8,
  },
  {
    id: "stamp-contact-1",
    type: "stamp",
    stampType: "contact",
    name: "Contact & Resume Bar",
    label:
      "Get in Touch: {{email}} • GitHub • LinkedIn • X/Twitter [Download Resume (PDF)]",
    x: 120,
    y: 690,
    width: 920,
    height: 52,
    strokeColor: "#4338ca",
    fillColor: "#eef2ff",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-desktop",
    zIndex: 9,
  },
  {
    id: "frame-portfolio-mobile",
    type: "frame",
    name: "Mobile Portfolio Frame",
    title: "Mobile Portfolio View (375x720)",
    preset: "mobile",
    x: 1140,
    y: 60,
    width: 380,
    height: 780,
    strokeColor: "#8b5cf6",
    fillColor: "#ffffff",
    strokeWidth: 2,
    opacity: 1,
    zIndex: 1,
    background: "#ffffff",
  },
  {
    id: "stamp-mob-nav",
    type: "stamp",
    stampType: "navbar",
    name: "Mobile Nav",
    label: "{{name}} • ☰ Menu • [Contact]",
    x: 1160,
    y: 90,
    width: 340,
    height: 48,
    strokeColor: "#334155",
    fillColor: "#f8fafc",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-mobile",
    zIndex: 2,
  },
  {
    id: "stamp-mob-hero",
    type: "stamp",
    stampType: "hero",
    name: "Mobile Bio",
    label: "{{name}} — {{title}}",
    sublabel:
      "Full-Stack & Product Design. Available for select consulting & full-time roles.",
    x: 1160,
    y: 155,
    width: 340,
    height: 120,
    strokeColor: "#475569",
    fillColor: "#f1f5f9",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-mobile",
    zIndex: 3,
  },
  {
    id: "stamp-mob-proj",
    type: "stamp",
    stampType: "project",
    name: "Featured Project",
    label: "Project Atlas (Featured)",
    sublabel: "Next.js, TypeScript, Tailwind",
    x: 1160,
    y: 295,
    width: 340,
    height: 130,
    strokeColor: "#6366f1",
    fillColor: "#ffffff",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-mobile",
    zIndex: 4,
  },
  {
    id: "stamp-mob-skills",
    type: "stamp",
    stampType: "skills",
    name: "Mobile Skills",
    label: "React • TypeScript • Next.js • Tailwind • Node.js",
    x: 1160,
    y: 445,
    width: 340,
    height: 80,
    strokeColor: "#059669",
    fillColor: "#ecfdf5",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-mobile",
    zIndex: 5,
  },
  {
    id: "stamp-mob-btn",
    type: "stamp",
    stampType: "button",
    name: "Contact Button",
    label: "✉️ Send Message / Book Call",
    x: 1160,
    y: 545,
    width: 340,
    height: 48,
    strokeColor: "#4338ca",
    fillColor: "#6366f1",
    strokeWidth: 1.5,
    opacity: 1,
    frameId: "frame-portfolio-mobile",
    zIndex: 6,
  },
];

export function createInitialPortfolio(): Portfolio {
  return {
    id: "demo-1",
    title: "Portfolio Wireframe",
    description:
      "Personal portfolio wireframe with interactive case studies, tech stack, and experience history.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: JSON.parse(JSON.stringify(INITIAL_SKETCH_ELEMENTS)),
    moodboard: [] as MoodboardItem[],
    theme: { ...DEFAULT_THEMES[0] },
    generatedDesigns: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 0.9,
    },
  };
}

export function createEmptyPortfolio(): Portfolio {
  return {
    id: generateSafeId(),
    title: "Untitled Portfolio",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [],
    moodboard: [] as MoodboardItem[],
    theme: { ...DEFAULT_THEMES[0] },
    generatedDesigns: [],
    viewport: {
      x: 0,
      y: 0,
      zoom: 0.9,
    },
  };
}

export function generateUniqueElementId(prefix = "el"): string {
  return generateSafeId(prefix);
}

export function remapElementIds(elements: CanvasElement[]): CanvasElement[] {
  const idMap = new Map<string, string>();
  for (const el of elements) {
    idMap.set(el.id, generateSafeId());
  }
  return elements.map((el) => {
    const next: CanvasElement = {
      ...el,
      id: idMap.get(el.id) ?? generateSafeId(),
      ...(el.frameId ? { frameId: idMap.get(el.frameId) ?? el.frameId } : {}),
    };
    if (next.type === "frame" && next.parentPageId) {
      next.parentPageId = idMap.get(next.parentPageId) ?? next.parentPageId;
    }
    return next;
  });
}

export interface TProfileTokens {
  name: string;
  title: string;
  email: string;
}

const PROFILE_TOKEN_PATTERN = /\{\{(name|title|email)\}\}/g;

const PROFILE_TOKEN_FALLBACKS: TProfileTokens = {
  name: "Your Name",
  title: "Your Title",
  email: "you@example.com",
};

// Starter sketches carry {{name}}/{{title}}/{{email}} tokens so a new portfolio
// shows the owner's details instead of a demo persona. Missing values fall back
// to neutral placeholders, so a raw token never reaches the canvas.
export function applyProfileTokens(
  elements: CanvasElement[],
  profile?: Partial<TProfileTokens>
): CanvasElement[] {
  const values: TProfileTokens = {
    name: profile?.name?.trim() || PROFILE_TOKEN_FALLBACKS.name,
    title: profile?.title?.trim() || PROFILE_TOKEN_FALLBACKS.title,
    email: profile?.email?.trim() || PROFILE_TOKEN_FALLBACKS.email,
  };
  const replace = (value: string | undefined) =>
    value?.replace(
      PROFILE_TOKEN_PATTERN,
      (_match, key: string) => values[key as keyof TProfileTokens]
    );

  return elements.map((element) => ({
    ...element,
    ...(element.type === "stamp"
      ? { label: replace(element.label), sublabel: replace(element.sublabel) }
      : {}),
    ...(element.type === "frame"
      ? {
          title: replace(element.title),
          description: replace(element.description),
        }
      : {}),
  }));
}
