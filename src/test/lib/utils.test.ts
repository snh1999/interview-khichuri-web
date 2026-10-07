import { describe, expect, it } from "vitest";
import {
  daysUntil,
  formatSectionLabel,
  getErrorMessage,
  getSystemTheme,
  isUrgent,
  stringToDate,
  stripEmptyString,
  stripNulls,
} from "@/lib/utils.ts";

describe("daysUntil / isUrgent", () => {
  it("returns null for missing dates", () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil(undefined)).toBeNull();
    expect(isUrgent(null)).toBe(false);
  });

  it("measures whole calendar days from today", () => {
    expect(daysUntil(new Date().toISOString())).toBe(0);
    expect(daysUntil(new Date(Date.now() + 86_400_000).toISOString())).toBe(1);
    expect(isUrgent(new Date().toISOString())).toBe(true);
    expect(
      isUrgent(new Date(Date.now() + 400 * 86_400_000).toISOString())
    ).toBe(false);
  });
});

describe("getErrorMessage", () => {
  it("reads Error, nested and flat messages", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
    expect(getErrorMessage({ error: { message: "nested" } })).toBe("nested");
    expect(getErrorMessage({ message: "flat" })).toBe("flat");
  });

  it("falls back for unknown errors", () => {
    expect(getErrorMessage({})).toBe("Something went wrong");
    expect(getErrorMessage("nope")).toBe("Something went wrong");
    expect(getErrorMessage(42)).toBe("Something went wrong");
  });
});

describe("getSystemTheme", () => {
  it("resolves light when the media query is off", () => {
    expect(getSystemTheme()).toBe("light");
  });
});

describe("stringToDate", () => {
  it("parses valid dates and rejects empty or invalid input", () => {
    expect(stringToDate("2024-01-15")?.getFullYear()).toBe(2024);
    expect(stringToDate("nope")).toBeUndefined();
    expect(stringToDate("")).toBeUndefined();
    expect(stringToDate(null)).toBeUndefined();
  });
});

describe("stripNulls", () => {
  it("drops nulls, trims strings and recurses", () => {
    expect(stripNulls({ a: 1, b: null, c: "  x  ", d: [1, null] })).toEqual({
      a: 1,
      c: "x",
      d: [1, undefined],
    });
  });

  it("keeps dates and numbers, drops empty strings", () => {
    const date = new Date(2024, 0, 1);
    expect(stripNulls(date)).toBe(date);
    expect(stripNulls("")).toBeUndefined();
    expect(stripNulls(0)).toBe(0);
  });
});

describe("stripEmptyString", () => {
  it("turns blank strings into undefined and trims the rest", () => {
    expect(stripEmptyString("   ")).toBeUndefined();
    expect(stripEmptyString(" a ")).toBe("a");
    expect(stripEmptyString(["a", " "])).toEqual(["a", undefined]);
    expect(stripEmptyString(null)).toBeNull();
    expect(stripEmptyString(5)).toBe(5);
  });

  it("recurses into objects and keeps dates", () => {
    const date = new Date(2024, 0, 1);
    expect(stripEmptyString({ a: "", b: date })).toEqual({
      a: undefined,
      b: date,
    });
  });
});

describe("formatSectionLabel", () => {
  it("splits camelCase and capitalises the first letter", () => {
    expect(formatSectionLabel("workExperience")).toBe("Work Experience");
    expect(formatSectionLabel("summary")).toBe("Summary");
    expect(formatSectionLabel("a")).toBe("A");
    expect(formatSectionLabel("")).toBe("");
  });
});
