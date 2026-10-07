import { describe, expect, it } from "vitest";
import { objectToString } from "@/lib/ai/objectToString.ts";

const ISO = "2026-01-15T12:00:00.000Z";
const formatted = new Date(ISO).toLocaleDateString();

describe("objectToString", () => {
  it("turns camelCase keys into labels and formats scalars", () => {
    const result = objectToString({
      firstName: "Ada",
      available: true,
      years: 3,
      startDate: ISO,
    });

    expect(result).toBe(
      [
        "First name: Ada",
        "Available: Yes",
        "Years: 3",
        `Start date: ${formatted}`,
      ].join("\n")
    );
  });

  it("formats Date instances and false booleans", () => {
    const result = objectToString({ open: false, end: new Date(ISO) });

    expect(result).toBe(["Open: No", `End: ${formatted}`].join("\n"));
  });

  it("skips blanks, empty arrays, omitted keys and omitted paths", () => {
    const result = objectToString(
      {
        name: "Ada",
        empty: "",
        nullable: null,
        missing: undefined,
        tags: [],
        hidden: "top",
        work: { company: "Acme", role: "Eng" },
      },
      { omit: ["hidden"], omitPaths: ["work.company"] }
    );

    expect(result).toBe(["Name: Ada", "Work:", "  Role: Eng"].join("\n"));
  });

  it("joins plain arrays and drops blank entries", () => {
    const result = objectToString({
      skills: ["react", "ts"],
      scores: [1, 2],
      tags: ["x", ""],
    });

    expect(result).toBe(
      ["Skills: react, ts", "Scores: 1, 2", "Tags: x"].join("\n")
    );
  });

  it("renders bulletKeys arrays as dashes", () => {
    const result = objectToString(
      { bullets: ["a", "b"] },
      { bulletKeys: ["bullets"] }
    );

    expect(result).toBe(["Bullets:", "  - a", "  - b"].join("\n"));
  });

  it("renders multiline bulletKeys strings as dashes", () => {
    const result = objectToString(
      { notes: "first\nsecond" },
      { bulletKeys: ["notes"] }
    );

    expect(result).toBe(["Notes:", "  - first", "  - second"].join("\n"));
  });

  it("indents and trims continuation lines of multiline scalars", () => {
    const result = objectToString({ bio: "first\n\n  second  " });

    expect(result).toBe(["Bio: first", "  second"].join("\n"));
  });

  it("renders a nested object under a labelled block", () => {
    const result = objectToString({
      name: "Ada",
      work: { role: "Eng", company: "Acme" },
    });

    expect(result).toBe(
      ["Name: Ada", "Work:", "  Role: Eng", "  Company: Acme"].join("\n")
    );
  });

  it("separates objects in an array with a blank line", () => {
    const result = objectToString({
      experience: [{ role: "Eng", company: "Acme" }, { role: "Lead" }],
    });

    expect(result).toBe(
      [
        "Experience:",
        "  Role: Eng",
        "  Company: Acme",
        "",
        "  Role: Lead",
      ].join("\n")
    );
  });

  it("inserts a blank line before an array block that follows a scalar", () => {
    const result = objectToString({
      name: "Ada",
      experience: [{ role: "Eng" }],
    });

    expect(result).toBe(
      ["Name: Ada", "", "Experience:", "  Role: Eng"].join("\n")
    );
  });
});
