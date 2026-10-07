import { describe, expect, it } from "vitest";
import type { TResumeFormData } from "@/components/resume/job-profile/resume.helpers.ts";
import {
  resolveSkillGroups,
  toSkillList,
} from "@/components/resume/template.helpers.ts";

const group = (id: string, label: string, keywords: string) => ({
  id,
  label,
  keywords,
});

const withGroups = (skillGroups: ReturnType<typeof group>[]): TResumeFormData =>
  ({ skillGroups }) as TResumeFormData;

describe("toSkillList", () => {
  it("splits, trims and drops empty entries", () => {
    expect(toSkillList("react, ts ,, css")).toEqual(["react", "ts", "css"]);
  });

  it("returns an empty list for blank input", () => {
    expect(toSkillList(null)).toEqual([]);
    expect(toSkillList("")).toEqual([]);
  });
});

describe("resolveSkillGroups", () => {
  it("returns an empty list when there are no groups", () => {
    expect(resolveSkillGroups({} as TResumeFormData)).toEqual([]);
    expect(
      resolveSkillGroups(withGroups([group("1", "Skills", "   ")]))
    ).toEqual([]);
  });

  it("blanks the label for a single Other group", () => {
    expect(
      resolveSkillGroups(withGroups([group("1", "Other", "react")]))
    ).toEqual([{ id: "1", label: "", keywords: "react" }]);
  });

  it("keeps and trims the label for a single named group", () => {
    expect(
      resolveSkillGroups(withGroups([group("1", "  Languages  ", "ts")]))
    ).toEqual([{ id: "1", label: "Languages", keywords: "ts" }]);
  });

  it("moves Other groups last and trims labels", () => {
    const result = resolveSkillGroups(
      withGroups([
        group("1", "Other", "misc"),
        group("2", "  Languages  ", "ts"),
        group("3", "Others", "extra"),
        group("4", "Empty", ""),
      ])
    );

    expect(result).toEqual([
      { id: "2", label: "Languages", keywords: "ts" },
      { id: "1", label: "Other", keywords: "misc" },
      { id: "3", label: "Others", keywords: "extra" },
    ]);
  });
});
