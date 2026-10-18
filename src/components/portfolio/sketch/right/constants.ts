import { FONT_FAMILIES } from "@/components/resume/font";

/** A per-property value that may differ across a multi-selection. */
export interface MixedState {
  isMixed: boolean;
  value?: string | number;
}

const HEX6_REGEX = /^#[0-9a-fA-F]{6}$/i;
const HEX8_REGEX = /^#[0-9a-fA-F]{8}$/i;
const HEX3_REGEX = /^#[0-9a-fA-F]{3}$/i;

const FONT_CSS_NAME: Record<string, string> = {
  arimo: "Arimo",
  carlito: "Carlito",
  "noto sans": "Noto Sans",
  inter: "Inter",
  "ibm plex sans": "IBM Plex Sans",
  "source sans 3": "Source Sans 3",
  "public sans": "Public Sans",
  garamond: "EB Garamond",
  "noto serif": "Noto Serif",
  lora: "Lora",
  merriweather: "Merriweather",
  libertinus: "Libertinus Serif",
  tinos: "Tinos",
  "crimson pro": "Crimson Pro",
  "source serif 4": "Source Serif 4",
};

export const FONT_FAMILY_OPTIONS = [
  { label: "Sans-Serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "monospace" },
  ...Object.keys(FONT_FAMILIES).map((name) => ({
    label: name,
    value: FONT_CSS_NAME[name.toLowerCase()] ?? name,
  })),
];

export const toValidHex6 = (color?: string, fallback = "#ffffff"): string => {
  if (!color || typeof color !== "string") {
    return fallback;
  }
  const trimmed = color.trim();
  if (HEX6_REGEX.test(trimmed)) {
    return trimmed;
  }
  if (HEX8_REGEX.test(trimmed)) {
    return trimmed.slice(0, 7);
  }
  if (HEX3_REGEX.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return fallback;
};
