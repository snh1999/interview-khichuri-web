import { describe, expect, it } from "vitest";
import type { ICompany } from "@/api/lookups";
import { getCompanySignalLine } from "@/components/company/company.helpers.ts";

const company = (overrides: Partial<ICompany> = {}): ICompany => ({
  id: 1,
  name: "Acme",
  ...overrides,
});

describe("getCompanySignalLine", () => {
  it("uses user-facing copy before research runs", () => {
    expect(getCompanySignalLine(company())).toBe("No details yet");
  });

  it("shows research ready even without a crawl date", () => {
    expect(getCompanySignalLine(company({ researchDossier: {} }))).toBe(
      "Research ready"
    );
  });

  it("combines research readiness with the crawl date", () => {
    expect(
      getCompanySignalLine(
        company({
          crawledAt: "2026-01-10T00:00:00.000Z",
          researchDossier: {},
        })
      ).startsWith("Research ready · Updated ")
    ).toBe(true);
  });
});
