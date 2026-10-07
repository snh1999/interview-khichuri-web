import { describe, expect, it } from "vitest";
import type { TResumeContent } from "@/components/resume/job-profile/resume.helpers.ts";
import {
  dateRange,
  formatToString,
  formatYear,
  resumeToText,
  stripProtocol,
} from "@/components/resume/utils.ts";

describe("formatToString", () => {
  it("formats dates, booleans and numbers", () => {
    const date = new Date(2024, 0, 15);

    expect(formatToString(date)).toBe(date.toLocaleDateString());
    expect(formatToString(true)).toBe("Yes");
    expect(formatToString(false)).toBe("No");
    expect(formatToString(3)).toBe("3");
    expect(formatToString("text")).toBe("text");
  });

  it("returns null for empty values", () => {
    expect(formatToString(undefined)).toBeNull();
    expect(formatToString(null)).toBeNull();
    expect(formatToString("")).toBeNull();
    expect(formatToString([])).toBeNull();
  });

  it("counts numeric arrays and joins the rest", () => {
    expect(formatToString([1, 2, 3], "items")).toBe("3 items");
    expect(formatToString(["a", "", "b"])).toBe("a, b");
  });
});

describe("formatYear / dateRange", () => {
  it("formats years and ignores invalid dates", () => {
    expect(formatYear(new Date(2024, 5, 1))).toBe("2024");
    expect(formatYear(null)).toBe("");
    expect(formatYear(new Date("nope"))).toBe("");
  });

  it("joins a range, using Present for current roles", () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 2, 1);

    expect(dateRange(start, end)).toBe("January, 2024 - March, 2024");
    expect(dateRange(start, end, true)).toBe("January, 2024 - Present");
    expect(dateRange(start, null)).toBe("January, 2024");
    expect(dateRange(start, end, false, true)).toBe("2024 - 2024");
  });
});

describe("stripProtocol", () => {
  it("removes http(s) only", () => {
    expect(stripProtocol("https://acme.com")).toBe("acme.com");
    expect(stripProtocol("http://acme.com")).toBe("acme.com");
    expect(stripProtocol("mailto:me@acme.com")).toBe("mailto:me@acme.com");
  });
});

describe("resumeToText", () => {
  it("returns an empty string without content", () => {
    expect(resumeToText(null)).toBe("");
  });

  it("omits ids and references and bullets responsibilities", () => {
    const content = {
      id: "resume-1",
      firstName: "Ada",
      references: "skip me",
      responsibilities: "did a\ndid b",
    } as unknown as TResumeContent;

    expect(resumeToText(content)).toBe(
      ["First name: Ada", "Responsibilities:", "  - did a", "  - did b"].join(
        "\n"
      )
    );
  });
});
