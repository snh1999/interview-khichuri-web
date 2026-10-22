import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime, formatTime } from "@/lib/date.ts";

const date = new Date(2026, 0, 15, 14, 30);

describe("date helpers", () => {
  it("formats a date with an explicit pattern", () => {
    expect(formatDate(date, "yyyy-MM-dd")).toBe("2026-01-15");
  });

  it("formats date and time", () => {
    expect(formatDateTime(date, "yyyy-MM-dd HH:mm")).toBe("2026-01-15 14:30");
  });

  it("formats time", () => {
    expect(formatTime(date, "HH:mm")).toBe("14:30");
  });

  it("falls back to native parsing for non-ISO strings", () => {
    expect(formatDate("January 15, 2026", "yyyy-MM-dd")).toBe("2026-01-15");
  });

  it("returns an empty string for missing or invalid values", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});
