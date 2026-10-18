/**
 * Utility to extract dominant colors and palette from an image element or URL using HTML5 Canvas.
 * Follows WCAG AA contrast standards for legible text and surface pairings.
 */

export interface ExtractedPalette {
  primary: string;
  secondary: string;
  accent: string;
  backgroundColor: string;
  surfaceColor: string;
  background: string;
  surface: string;
  textColor: string;
  textMutedColor: string;
  isDark: boolean;
  palette: string[];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!hex || typeof hex !== "string") {
    return { r: 0, g: 0, b: 0 };
  }
  const trimmed = hex.trim();

  if (trimmed.startsWith("rgb")) {
    const match = trimmed.match(/\d+(\.\d+)?/g);
    if (match && match.length >= 3) {
      return {
        r: Math.min(255, Math.max(0, Math.round(Number(match[0])))),
        g: Math.min(255, Math.max(0, Math.round(Number(match[1])))),
        b: Math.min(255, Math.max(0, Math.round(Number(match[2])))),
      };
    }
  }

  if (trimmed.startsWith("hsl")) {
    const match = trimmed.match(/\d+(\.\d+)?/g);
    if (match && match.length >= 3) {
      const h = Number(match[0]) % 360;
      const s = Math.min(100, Number(match[1])) / 100;
      const l = Math.min(100, Number(match[2])) / 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r1 = 0,
        g1 = 0,
        b1 = 0;
      if (h < 60) {
        r1 = c;
        g1 = x;
        b1 = 0;
      } else if (h < 120) {
        r1 = x;
        g1 = c;
        b1 = 0;
      } else if (h < 180) {
        r1 = 0;
        g1 = c;
        b1 = x;
      } else if (h < 240) {
        r1 = 0;
        g1 = x;
        b1 = c;
      } else if (h < 300) {
        r1 = x;
        g1 = 0;
        b1 = c;
      } else {
        r1 = c;
        g1 = 0;
        b1 = x;
      }
      return {
        r: Math.round((r1 + m) * 255),
        g: Math.round((g1 + m) * 255),
        b: Math.round((b1 + m) * 255),
      };
    }
  }

  let cleanHex = trimmed.replace("#", "").trim();
  if (cleanHex.length === 8) {
    cleanHex = cleanHex.slice(0, 6);
  } else if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = Number.parseInt(cleanHex.slice(0, 2), 16) || 0;
  const g = Number.parseInt(cleanHex.slice(2, 4), 16) || 0;
  const b = Number.parseInt(cleanHex.slice(4, 6), 16) || 0;
  return { r, g, b };
}

// Calculate standard WCAG relative luminance (sRGB linear)
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.039_28 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function isColorLight(hex: string): boolean {
  return getLuminance(hex) > 0.35;
}

// Calculate contrast ratio between two hex colors (1:1 to 21:1)
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract dominant colors from an Image or Canvas data
 */
export function extractColorsFromImageUrl(imageUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const fallbackColors = [
      "#6366f1",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#0f172a",
    ];
    Object.defineProperty(fallbackColors, "isFallback", {
      value: true,
      enumerable: false,
    });

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(fallbackColors);
          return;
        }

        // Downscale for fast color quantization
        const width = 64;
        const height = 64;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height).data;

        const colorCounts: { [hex: string]: number } = {};
        const step = 4; // Sample every 4th pixel for performance

        for (let i = 0; i < imageData.length; i += 4 * step) {
          const r = Math.round(imageData[i] / 20) * 20;
          const g = Math.round(imageData[i + 1] / 20) * 20;
          const b = Math.round(imageData[i + 2] / 20) * 20;
          const a = imageData[i + 3];

          if (a < 128) {
            continue;
          }

          const hex = rgbToHex(r, g, b);
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        const sortedColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([hex]) => hex);

        const distinctColors: string[] = [];
        for (const color of sortedColors) {
          const isTooSimilar = distinctColors.some((existing) => {
            const rgb1 = hexToRgb(existing);
            const rgb2 = hexToRgb(color);
            const colorDist = Math.hypot(
              rgb1.r - rgb2.r,
              rgb1.g - rgb2.g,
              rgb1.b - rgb2.b
            );
            const lumDiff = Math.abs(
              getLuminance(existing) - getLuminance(color)
            );
            return colorDist < 45 && lumDiff < 0.08;
          });

          if (!isTooSimilar) {
            distinctColors.push(color);
          }

          if (distinctColors.length >= 6) {
            break;
          }
        }

        if (distinctColors.length >= 3) {
          Object.defineProperty(distinctColors, "isFallback", {
            value: false,
            enumerable: false,
          });
          resolve(distinctColors);
        } else {
          resolve(fallbackColors);
        }
      } catch (err) {
        console.warn(
          "[colorExtractor] Canvas color extraction error (likely CORS):",
          err
        );
        resolve(fallbackColors);
      }
    };

    img.onerror = () => {
      resolve(fallbackColors);
    };

    img.src = imageUrl;
  });
}

/**
 * Generate a cohesive theme token structure from extracted raw colors with guaranteed contrast
 */
export function buildThemeFromPalette(
  colors: string[],
  _name = "Extracted Inspiration",
  forceMode?: "light" | "dark"
): ExtractedPalette {
  const safeColors =
    colors.length > 0
      ? colors
      : ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#0f172a"];

  const getChroma = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    return Math.max(r, g, b) - Math.min(r, g, b);
  };

  // Find vibrant colors by prioritizing higher chroma candidates (not near-black/near-white neutrals)
  const vibrantCandidates = safeColors.filter((c) => {
    const lum = getLuminance(c);
    const chroma = getChroma(c);
    return chroma >= 25 && lum > 0.08 && lum < 0.92;
  });

  const orderedColors =
    vibrantCandidates.length >= 2
      ? [
          ...vibrantCandidates,
          ...safeColors.filter((c) => !vibrantCandidates.includes(c)),
        ]
      : safeColors;

  const primary = orderedColors[0] || "#6366f1";
  const secondary = orderedColors[1] || "#06b6d4";
  const accent = orderedColors[2] || "#f59e0b";

  const avgLum =
    safeColors.reduce((acc, c) => acc + getLuminance(c), 0) / safeColors.length;
  const isDark = forceMode ? forceMode === "dark" : avgLum < 0.4;

  let bg: string;
  let surface: string;
  let text: string;
  let textMuted: string;

  if (isDark) {
    // Dark theme: obsidian / midnight slate canvas with crisp light text
    bg = "#090d16";
    surface = "#0f172a";
    text = "#f8fafc";
    textMuted = "#94a3b8";
  } else {
    // Light theme: clean off-white / porcelain canvas with high-contrast carbon text
    bg = "#ffffff";
    surface = "#f8fafc";
    text = "#0f172a";
    textMuted = "#475569";
  }

  return {
    primary,
    secondary,
    accent,
    backgroundColor: bg,
    surfaceColor: surface,
    background: bg,
    surface,
    textColor: text,
    textMutedColor: textMuted,
    isDark,
    palette: safeColors.slice(0, 6),
  };
}
