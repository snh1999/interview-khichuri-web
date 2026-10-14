// eslint-disable-next-line unicorn/prevent-abbreviations
export interface IOklchColor {
  lightness: number;
  chroma: number;
  hue: number;
  alpha?: number;
}

const COLOR_STRING_REGEX =
  /oklch\(\s*(?<lightness>[\d.]+)\s+(?<chroma>[\d.]+)\s+(?<hue>[\d.]+)(?:\s*\/\s*(?<alpha>[\d.]+)(?<alphaUnit>%?))?\s*\)/u;
// the parsing is not extensive intentionally for theme usecase
// percentages on L (50%), angle units on H (180deg), none
export const parseOklch = (colorString: string): IOklchColor | null => {
  const match = COLOR_STRING_REGEX.exec(colorString.trim());

  if (!match?.groups) {
    return null;
  }

  const { lightness, chroma, hue, alpha, alphaUnit } = match.groups;

  let alphaValue: number | undefined;

  if (alpha) {
    const value = Number.parseFloat(alpha);
    alphaValue = alphaUnit === "%" ? value / 100 : value;
  }

  return {
    lightness: Number.parseFloat(lightness),
    chroma: Number.parseFloat(chroma),
    hue: Number.parseFloat(hue),
    alpha: alphaValue,
  };
};

const r4 = (n0: number): number => Math.round(n0 * 10_000) / 10_000;

export const formatOklch = ({
  lightness,
  chroma,
  hue,
  alpha,
}: IOklchColor): string => {
  const base = `oklch(${r4(lightness)} ${r4(chroma)} ${r4(hue)})`;
  if (alpha !== undefined) {
    return `oklch(${r4(lightness)} ${r4(chroma)} ${r4(hue)} / ${Math.round(alpha * 100)}%)`;
  }
  return base;
};

const linearize = (color: number): number => {
  const abs = Math.abs(color);
  if (abs <= 0.040_45) {
    return color / 12.92;
  }
  return Math.sign(color) * ((abs + 0.055) / 1.055) ** 2.4;
};

const delinearize = (color: number): number => {
  const abs = Math.abs(color);
  if (abs <= 0.003_130_8) {
    return 12.92 * color;
  }
  return Math.sign(color) * (1.055 * abs ** (1 / 2.4) - 0.055);
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const oklchToHex = ({ lightness, chroma, hue }: IOklchColor): string => {
  const hRad = (hue * Math.PI) / 180;
  const cos = chroma * Math.cos(hRad);
  const sin = chroma * Math.sin(hRad);

  const lc = (lightness + 0.396_337_777_4 * cos + 0.215_803_757_3 * sin) ** 3;
  const mc = (lightness - 0.105_561_345_8 * cos - 0.063_854_172_8 * sin) ** 3;
  const sc = (lightness - 0.089_484_182 * cos - 1.291_485_548 * sin) ** 3;

  const rLin =
    4.076_741_662_1 * lc - 3.307_711_591_3 * mc + 0.230_969_929_2 * sc;
  const gLin =
    -1.268_438_004_6 * lc + 2.609_757_401_1 * mc - 0.341_319_396_5 * sc;
  const bLin =
    -0.004_196_086_3 * lc - 0.703_418_614_7 * mc + 1.707_614_701 * sc;

  const toHex = (value: number) =>
    Math.round(clamp01(delinearize(value)) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(rLin)}${toHex(gLin)}${toHex(bLin)}`;
};

const HEX_STRING_REGEX = /^#(?<r>[\da-f])(?<g>[\da-f])(?<b>[\da-f])$/iu;
const NORMALIZED_REGEX = /^#[\da-f]{6}$/iu;
export const hexToOklch = (hex: string): IOklchColor => {
  const normalized = hex.replace(
    HEX_STRING_REGEX,
    (_, _r, _g, _b) => `#${_r}${_r}${_g}${_g}${_b}${_b}`
  );

  if (!NORMALIZED_REGEX.test(normalized)) {
    return { lightness: 0, chroma: 0, hue: 0 };
  }

  const r = linearize(Number.parseInt(normalized.slice(1, 3), 16) / 255);
  const g = linearize(Number.parseInt(normalized.slice(3, 5), 16) / 255);
  const b = linearize(Number.parseInt(normalized.slice(5, 7), 16) / 255);

  const l = Math.cbrt(
    0.412_221_470_8 * r + 0.536_332_536_3 * g + 0.051_445_992_9 * b
  );
  const m = Math.cbrt(
    0.211_903_498_2 * r + 0.680_699_545_1 * g + 0.107_396_956_6 * b
  );
  const s = Math.cbrt(
    0.088_302_461_9 * r + 0.281_718_837_6 * g + 0.629_978_700_5 * b
  );

  const lightness =
    0.210_454_255_3 * l + 0.793_617_785 * m - 0.004_072_046_8 * s;
  const aValue = 1.977_998_495_1 * l - 2.428_592_205 * m + 0.450_593_709_9 * s;
  const bValue = 0.025_904_037_1 * l + 0.782_771_766_2 * m - 0.808_675_766 * s;

  const chroma = Math.hypot(aValue, bValue);
  let hue = (Math.atan2(bValue, aValue) * 180) / Math.PI;
  if (hue < 0) {
    hue += 360;
  }

  return { lightness, chroma, hue };
};

export const applyHexToOklchString = (
  hex: string,
  existingString: string
): string => {
  const existing = parseOklch(existingString);
  const next = hexToOklch(hex);
  return formatOklch({ ...next, alpha: existing?.alpha });
};

export const oklchStringToHex = (input: string): string => {
  const parsed = parseOklch(input);
  if (!parsed) {
    return "#000000";
  }
  try {
    return oklchToHex(parsed);
  } catch {
    return "#000000";
  }
};
