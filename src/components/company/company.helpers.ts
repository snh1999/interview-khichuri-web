import { generatePath, useNavigate } from "react-router";
import type { ICompany } from "@/api/lookups";
import { COMPANY_DETAIL_PAGE } from "@/app.constants.ts";
import { formatRelative } from "@/lib/date";

export const getCompanyPath = (companyId: number) =>
  generatePath(COMPANY_DETAIL_PAGE, { companyId: String(companyId) });

export const getCompanyAliasLine = (company: ICompany) =>
  company.aliases?.length
    ? `Also known as ${company.aliases.join(", ")}`
    : null;

export const getCompanySignalLine = (company: ICompany) => {
  const activity = company.crawledAt
    ? `Updated ${formatRelative(company.crawledAt)}`
    : null;

  if (company.researchDossier) {
    return activity ? `Research ready · ${activity}` : "Research ready";
  }
  return activity ?? "No details yet";
};

export const useNavigateToCompanyPage = (companyId: number) => {
  const navigate = useNavigate();
  return () => navigate(getCompanyPath(companyId));
};
