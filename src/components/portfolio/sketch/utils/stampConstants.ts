import type { StampType } from "../types";

export interface StampDefinition {
  type: StampType;
  width: number;
  height: number;
  label: string;
  sublabel: string;
  strokeColor: string;
  fillColor: string;
}

export const STAMP_DEFINITIONS: Record<StampType, StampDefinition> = {
  navbar: {
    type: "navbar",
    width: 920,
    height: 54,
    label: "Portfolio Navigation • About • Projects • Stack • [Contact]",
    sublabel: "",
    strokeColor: "#334155",
    fillColor: "#f8fafc",
  },
  hero: {
    type: "hero",
    width: 920,
    height: 160,
    label: "Your Name — Your Title",
    sublabel:
      "Building scalable distributed systems and refined user interfaces.",
    strokeColor: "#475569",
    fillColor: "#f1f5f9",
  },
  project: {
    type: "project",
    width: 300,
    height: 175,
    label: "✦ Nova AI Studio",
    sublabel: "Next.js 15, TypeScript, Canvas Engine • 12k+ active users",
    strokeColor: "#6366f1",
    fillColor: "#ffffff",
  },
  skills: {
    type: "skills",
    width: 440,
    height: 110,
    label:
      "Core Stack: React 19, TypeScript, Tailwind, Node.js, Go, PostgreSQL",
    sublabel: "",
    strokeColor: "#059669",
    fillColor: "#ecfdf5",
  },
  experience: {
    type: "experience",
    width: 440,
    height: 110,
    label:
      "Experience: Staff Engineer @ Horizon (2023-Now) • Senior Dev @ Vercel",
    sublabel: "",
    strokeColor: "#d97706",
    fillColor: "#fffbeb",
  },
  testimonial: {
    type: "testimonial",
    width: 440,
    height: 110,
    label: '"A short testimonial from a colleague or manager."',
    sublabel: "— VP of Engineering",
    strokeColor: "#ec4899",
    fillColor: "#fdf2f8",
  },
  contact: {
    type: "contact",
    width: 920,
    height: 52,
    label:
      "Get in Touch: you@example.com • GitHub • LinkedIn • [Download Resume]",
    sublabel: "",
    strokeColor: "#4338ca",
    fillColor: "#eef2ff",
  },
  button: {
    type: "button",
    width: 160,
    height: 42,
    label: "Explore Work →",
    sublabel: "",
    strokeColor: "#4338ca",
    fillColor: "#6366f1",
  },
  input: {
    type: "input",
    width: 240,
    height: 40,
    label: "Search projects...",
    sublabel: "",
    strokeColor: "#94a3b8",
    fillColor: "#ffffff",
  },
  card: {
    type: "card",
    width: 280,
    height: 140,
    label: "Feature Container Card",
    sublabel: "Modular content section or project overview showcase",
    strokeColor: "#94a3b8",
    fillColor: "#ffffff",
  },
  avatar: {
    type: "avatar",
    width: 80,
    height: 80,
    label: "Profile Avatar",
    sublabel: "",
    strokeColor: "#6366f1",
    fillColor: "#e0e7ff",
  },
  image: {
    type: "image",
    width: 280,
    height: 180,
    label: "Image Showcase",
    sublabel: "Visual prototype capture",
    strokeColor: "#94a3b8",
    fillColor: "#f8fafc",
  },
  badge: {
    type: "badge",
    width: 120,
    height: 32,
    label: "TypeScript",
    sublabel: "",
    strokeColor: "#0284c7",
    fillColor: "#e0f2fe",
  },
  table: {
    type: "table",
    width: 440,
    height: 160,
    label: "Data Grid / Table",
    sublabel: "Comparative specifications matrix",
    strokeColor: "#64748b",
    fillColor: "#ffffff",
  },
  sidebar: {
    type: "sidebar",
    width: 200,
    height: 400,
    label: "Navigation Sidebar",
    sublabel: "",
    strokeColor: "#475569",
    fillColor: "#f8fafc",
  },
  stats: {
    type: "stats",
    width: 200,
    height: 90,
    label: "120k+ Users",
    sublabel: "Active production engagements",
    strokeColor: "#7c3aed",
    fillColor: "#f5f3ff",
  },
};

export function getStampDefaults(stampType: StampType): StampDefinition {
  return (
    STAMP_DEFINITIONS[stampType] || {
      type: stampType,
      width: 280,
      height: 140,
      label: `${stampType.toUpperCase()} Block`,
      sublabel: "",
      strokeColor: "#6366f1",
      fillColor: "#ffffff",
    }
  );
}
