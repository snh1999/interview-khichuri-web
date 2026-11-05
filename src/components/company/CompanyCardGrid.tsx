import { CaretRightIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import type { ICompany } from "@/api/lookups";
import {
  getCompanyAliasLine,
  getCompanyPath,
  getCompanySignalLine,
} from "@/components/company/company.helpers.ts";
import { GutterCard } from "@/components/ui/custom/GutterCard.tsx";

interface IProps {
  company: ICompany;
}

export const CompanyCardGrid = ({ company }: Readonly<IProps>) => {
  const aliasLine = getCompanyAliasLine(company);

  return (
    <GutterCard
      className="relative flex flex-col justify-between gap-3 pt-3"
      variant="default"
    >
      <Link
        aria-label={`View ${company.name}`}
        className="focus-visible:ring-ring absolute inset-0 rounded-xs focus-visible:ring-2 focus-visible:outline-none"
        to={getCompanyPath(company.id)}
      />
      <div className="flex items-start justify-between gap-3">
        <h2
          className="text-foreground text-md truncate leading-tight font-semibold"
          title={company.name}
        >
          {company.name}
        </h2>
        <CaretRightIcon className="text-muted-foreground size-4 shrink-0" />
      </div>
      <div className="min-w-0 space-y-0.5">
        {aliasLine ? (
          <p className="text-muted-foreground truncate text-xs">{aliasLine}</p>
        ) : null}
        <p className="text-muted-foreground truncate text-xs">
          {getCompanySignalLine(company)}
        </p>
      </div>
    </GutterCard>
  );
};
