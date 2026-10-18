import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CanvasElement,
  StampType,
} from "@/components/portfolio/sketch/types";
import {
  buildThemeFromPalette,
  extractColorsFromImageUrl,
  getContrastRatio,
  getLuminance,
  hexToRgb,
  isColorLight,
  rgbToHex,
} from "@/components/portfolio/sketch/utils/colorExtractor";
import { getEmptyFramePosition } from "@/components/portfolio/sketch/utils/framePlacement";
import {
  getStampDefaults,
  STAMP_DEFINITIONS,
} from "@/components/portfolio/sketch/utils/stampConstants";
import { getCenteredViewport } from "@/components/portfolio/sketch/utils/viewport";
import { getNextZIndex } from "@/components/portfolio/sketch/utils/zIndex";
import { useSketchBuilderStore } from "@/store/sketchBuilderStore";

describe("rgbToHex", () => {
  it("formats channels as zero-padded hex", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
    expect(rgbToHex(10, 10, 10)).toBe("#0a0a0a");
  });

  it("clamps out-of-range channels and rounds fractions", () => {
    expect(rgbToHex(300, -5, 128.6)).toBe("#ff0081");
  });
});

describe("hexToRgb", () => {
  it("returns black for empty or non-string input", () => {
    expect(hexToRgb("")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb(null as unknown as string)).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("parses 6-digit, 3-digit and 8-digit hex", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#ff000080")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses rgb() and clamps its channels", () => {
    expect(hexToRgb("rgb(10, 20, 30)")).toEqual({ r: 10, g: 20, b: 30 });
    expect(hexToRgb("rgb(300, 20, 40)")).toEqual({ r: 255, g: 20, b: 40 });
  });

  it("parses hsl() through the hue branches", () => {
    expect(hexToRgb("hsl(0, 100%, 50%)")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("hsl(120, 100%, 50%)")).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb("hsl(240, 100%, 50%)")).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("falls back to zero for unparseable hex", () => {
    expect(hexToRgb("#zzzzzz")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("getLuminance / isColorLight / getContrastRatio", () => {
  it("scores black at 0 and white at 1", () => {
    expect(getLuminance("#000000")).toBe(0);
    expect(getLuminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("classifies light vs dark colours", () => {
    expect(isColorLight("#ffffff")).toBe(true);
    expect(isColorLight("#000000")).toBe(false);
  });

  it("computes the WCAG contrast extremes", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(getContrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
    expect(getContrastRatio("#ffffff", "#000000")).toBeCloseTo(
      getContrastRatio("#000000", "#ffffff"),
      5
    );
  });
});

describe("buildThemeFromPalette", () => {
  it("uses fallback tokens for an empty palette", () => {
    const theme = buildThemeFromPalette([]);
    expect(theme.primary).toBe("#6366f1");
    expect(theme.secondary).toBe("#06b6d4");
    expect(theme.accent).toBe("#10b981");
    expect(theme.palette).toHaveLength(5);
  });

  it("builds a dark theme for dark colours", () => {
    const theme = buildThemeFromPalette(["#000000", "#050505"]);
    expect(theme.isDark).toBe(true);
    expect(theme.backgroundColor).toBe("#090d16");
    expect(theme.surfaceColor).toBe("#0f172a");
    expect(theme.textColor).toBe("#f8fafc");
    expect(theme.textMutedColor).toBe("#94a3b8");
  });

  it("builds a light theme for light colours", () => {
    const theme = buildThemeFromPalette(["#ffffff", "#f8fafc"]);
    expect(theme.isDark).toBe(false);
    expect(theme.backgroundColor).toBe("#ffffff");
    expect(theme.surface).toBe("#f8fafc");
    expect(theme.textColor).toBe("#0f172a");
    expect(theme.textMutedColor).toBe("#475569");
  });

  it("honours an explicit forceMode", () => {
    expect(buildThemeFromPalette(["#ffffff"], undefined, "dark").isDark).toBe(
      true
    );
    expect(buildThemeFromPalette(["#000000"], undefined, "light").isDark).toBe(
      false
    );
  });

  it("orders vibrant colours ahead of neutrals", () => {
    const theme = buildThemeFromPalette(["#000000", "#ff0000", "#00ff00"]);
    expect(theme.primary).toBe("#ff0000");
    expect(theme.secondary).toBe("#00ff00");
    expect(theme.accent).toBe("#000000");
  });

  it("caps the palette at six colours", () => {
    const theme = buildThemeFromPalette([
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#00ffff",
      "#ff00ff",
      "#111111",
      "#222222",
    ]);
    expect(theme.palette).toHaveLength(6);
  });
});

const FALLBACK = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#0f172a"];

const imageDataFor = (colors: [number, number, number, number][]) => {
  const data = new Uint8ClampedArray(colors.length * 16);
  colors.forEach(([r, g, b, a], index) => {
    const offset = index * 16;
    data[offset] = r;
    data[offset + 1] = g;
    data[offset + 2] = b;
    data[offset + 3] = a;
  });
  return data;
};

const installCanvas = (
  imageData: Uint8ClampedArray | null,
  options: { nullContext?: boolean; throwOnRead?: boolean } = {}
) => {
  const context = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => {
      if (options.throwOnRead) {
        throw new Error("canvas is tainted");
      }
      return { data: imageData ?? new Uint8ClampedArray(0) };
    }),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() =>
    options.nullContext
      ? null
      : context) as unknown as typeof HTMLCanvasElement.prototype.getContext);
  return context;
};

class MockImage {
  crossOrigin = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private source = "";

  get src() {
    return this.source;
  }

  set src(value: string) {
    this.source = value;
    queueMicrotask(() => {
      if (value.includes("boom")) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

describe("extractColorsFromImageUrl", () => {
  const originalImage = globalThis.Image;

  beforeEach(() => {
    vi.stubGlobal("Image", MockImage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("Image", originalImage);
  });

  it("resolves distinct, non-fallback colours from a decoded image", async () => {
    installCanvas(
      imageDataFor([
        [220, 40, 40, 255],
        [40, 220, 40, 255],
        [40, 40, 220, 255],
        [220, 220, 40, 255],
        [10, 10, 10, 0],
      ])
    );

    const result = await extractColorsFromImageUrl("data:image/png;base64,ok");

    expect(result).toHaveLength(4);
    expect((result as unknown as { isFallback?: boolean }).isFallback).toBe(
      false
    );
    expect(result).toContain("#dc2828");
  });

  it("falls back when fewer than three distinct colours survive", async () => {
    installCanvas(
      imageDataFor([
        [100, 100, 100, 255],
        [105, 100, 100, 255],
        [100, 105, 100, 255],
      ])
    );

    const result = await extractColorsFromImageUrl(
      "data:image/png;base64,flat"
    );

    expect(result).toEqual(FALLBACK);
    expect((result as unknown as { isFallback?: boolean }).isFallback).toBe(
      true
    );
  });

  it("falls back when the 2d context is unavailable", async () => {
    installCanvas(null, { nullContext: true });

    const result = await extractColorsFromImageUrl(
      "data:image/png;base64,noctx"
    );

    expect(result).toEqual(FALLBACK);
  });

  it("falls back when reading pixels throws (CORS taint)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    installCanvas(null, { throwOnRead: true });

    const result = await extractColorsFromImageUrl(
      "data:image/png;base64,taint"
    );

    expect(result).toEqual(FALLBACK);
    expect(warn).toHaveBeenCalled();
  });

  it("falls back when the image fails to load", async () => {
    installCanvas(imageDataFor([[220, 40, 40, 255]]));

    const result = await extractColorsFromImageUrl("boom://missing.png");

    expect(result).toEqual(FALLBACK);
  });
});

describe("getEmptyFramePosition", () => {
  const frameAt = (overrides: Partial<CanvasElement> = {}): CanvasElement =>
    ({
      id: "f",
      type: "frame",
      title: "f",
      preset: "desktop",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: 1,
      ...overrides,
    }) as CanvasElement;

  it("uses the canvas origin when there are no frames", () => {
    expect(getEmptyFramePosition([])).toEqual({ x: 80, y: 60 });
  });

  it("ignores non-frame elements", () => {
    const rect = { ...frameAt(), type: "rectangle" } as CanvasElement;
    expect(getEmptyFramePosition([rect])).toEqual({ x: 80, y: 60 });
  });

  it("places the frame to the right of the rightmost frame", () => {
    const elements = [
      frameAt({ id: "a", x: 100, width: 200 }),
      frameAt({ id: "b", x: 500, width: 100 }),
    ];
    expect(getEmptyFramePosition(elements)).toEqual({ x: 680, y: 60 });
  });
});

describe("getStampDefaults", () => {
  it("returns the exact definition for known stamp types", () => {
    expect(getStampDefaults("hero")).toBe(STAMP_DEFINITIONS.hero);
    expect(getStampDefaults("hero").width).toBe(920);
    expect(getStampDefaults("button").height).toBe(42);
  });

  it("defines a positive size and label for every stamp type", () => {
    for (const definition of Object.values(STAMP_DEFINITIONS)) {
      expect(definition.width).toBeGreaterThan(0);
      expect(definition.height).toBeGreaterThan(0);
      expect(definition.label.length).toBeGreaterThan(0);
    }
  });

  it("synthesises a fallback for an unknown stamp type", () => {
    const fallback = getStampDefaults("mystery" as StampType);
    expect(fallback.width).toBe(280);
    expect(fallback.height).toBe(140);
    expect(fallback.label).toBe("MYSTERY Block");
    expect(fallback.strokeColor).toBe("#6366f1");
  });
});

describe("getCenteredViewport", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 768,
      writable: true,
    });
  });

  const element = { x: 100, y: 50, width: 200, height: 100 };

  it("centres an element at zoom 1", () => {
    expect(getCenteredViewport(element, { x: 0, y: 0, zoom: 1 })).toEqual({
      x: 152,
      y: 244,
      zoom: 1,
    });
  });

  it("scales the offset and preserves zoom when zoomed", () => {
    expect(getCenteredViewport(element, { x: 0, y: 0, zoom: 2 })).toEqual({
      x: -48,
      y: 144,
      zoom: 2,
    });
    expect(getCenteredViewport(element, { x: 5, y: 9, zoom: 0.5 })).toEqual({
      x: 252,
      y: 294,
      zoom: 0.5,
    });
  });

  it("uses the measured canvas size over the window estimate", () => {
    useSketchBuilderStore.setState({ canvasSize: { width: 400, height: 600 } });
    try {
      expect(getCenteredViewport(element, { x: 0, y: 0, zoom: 1 })).toEqual({
        x: 0,
        y: 200,
        zoom: 1,
      });
    } finally {
      useSketchBuilderStore.setState({ canvasSize: { width: 0, height: 0 } });
    }
  });
});

describe("getNextZIndex", () => {
  const el = (zIndex: number | undefined): CanvasElement =>
    ({ zIndex }) as CanvasElement;

  it("returns 1 for an empty canvas", () => {
    expect(getNextZIndex([])).toBe(1);
  });

  it("returns one above the highest zIndex", () => {
    expect(getNextZIndex([el(1), el(5), el(3)])).toBe(6);
  });

  it("treats missing zIndexes as zero", () => {
    expect(getNextZIndex([el(0), el(undefined)])).toBe(1);
  });
});
