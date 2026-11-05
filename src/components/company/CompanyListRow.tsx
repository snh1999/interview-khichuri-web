import { BuildingsIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Link } from "react-router";
import type { ICompany } from "@/api/lookups";
import {
  getCompanyAliasLine,
  getCompanyPath,
  getCompanySignalLine,
} from "@/components/company/company.helpers.ts";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "@/components/ui/item.tsx";

interface IProps {
  company: ICompany;
}

export const CompanyListRow = ({ company }: Readonly<IProps>) => {
  const aliasLine = getCompanyAliasLine(company);

  return (
    <Item
      className="bg-muted/60 rounded-sm"
      render={
        <Link
          aria-label={`View ${company.name}`}
          to={getCompanyPath(company.id)}
        />
      }
    >
      <ItemMedia variant="icon">
        <BuildingsIcon />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-0.5">
        <h2 className="min-w-0 flex-1 truncate text-sm" title={company.name}>
          {company.name}
        </h2>
        {aliasLine ? (
          <span className="text-muted-foreground truncate text-xs">
            {aliasLine}
          </span>
        ) : null}
        <span className="text-muted-foreground truncate text-xs">
          {getCompanySignalLine(company)}
        </span>
      </ItemContent>
      <ItemActions>
        <CaretRightIcon className="text-muted-foreground size-4 shrink-0" />
      </ItemActions>
    </Item>
  );
};
