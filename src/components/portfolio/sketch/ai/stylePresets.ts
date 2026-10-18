export interface StylePreset {
  id: string;
  name: string;
  vibe: string;
  badge: string;
  primary: string;
  accent: string;
  bg: string;
  surface: string;
  textColor: string;
  font: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "dark-luxury",
    name: "Obsidian & Electric Indigo",
    vibe: "Premium dark palette with glowing indigo/violet accents, refined typography, and high contrast.",
    badge: "Luxury Dark",
    primary: "#6366f1",
    accent: "#10b981",
    bg: "#090d16",
    surface: "#0f172a",
    textColor: "#f8fafc",
    font: "font-sans font-bold",
  },
  {
    id: "swiss-editorial",
    name: "Swiss Minimal Editorial",
    vibe: "Clean, high-contrast monochrome layout with massive typography, precise grid structure, and generous whitespace.",
    badge: "Minimal",
    primary: "#0f172a",
    accent: "#e11d48",
    bg: "#ffffff",
    surface: "#f8fafc",
    textColor: "#09090b",
    font: "font-serif font-bold",
  },
  {
    id: "cyber-dev",
    name: "Terminal Emerald CLI",
    vibe: "Monospace hacker aesthetic with emerald accents, dark slate panels, and developer-centric tokens.",
    badge: "Developer",
    primary: "#10b981",
    accent: "#06b6d4",
    bg: "#050811",
    surface: "#0a101f",
    textColor: "#f1f5f9",
    font: "font-mono",
  },
  {
    id: "warm-sunset",
    name: "Warm Sunset & Terracotta",
    vibe: "Rich warm tones with terracotta orange and soft cream surfaces for creative & studio portfolios.",
    badge: "Creative",
    primary: "#f97316",
    accent: "#ec4899",
    bg: "#0c0a09",
    surface: "#1c1917",
    textColor: "#fafaf9",
    font: "font-sans font-bold",
  },
];
