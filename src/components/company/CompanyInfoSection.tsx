import { ArrowSquareOutIcon, BuildingsIcon } from "@phosphor-icons/react";
import type { ICompany } from "@/api/lookups";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card.tsx";
import { isHttpUrl } from "@/lib/utils";

interface IProps {
  company: ICompany;
}

export const CompanyInfoSection = ({ company }: Readonly<IProps>) => {
  const links = (company.links ?? []).filter((link) => isHttpUrl(link.url));
  const hasCareerPage = company.careerPageUrl
    ? isHttpUrl(company.careerPageUrl)
    : false;

  return (
    <Card className="w-full">
      <CardHeader>
        <h1 className="font-heading text-xl font-medium wrap-break-word">
          {company.name}
        </h1>
        {company.aliases?.length ? (
          <CardDescription>
            Also known as {company.aliases.join(", ")}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        {hasCareerPage || links.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {company.careerPageUrl && hasCareerPage ? (
              <a
                className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline"
                href={company.careerPageUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <BuildingsIcon className="size-3.5" />
                Career page
                <ArrowSquareOutIcon className="size-3.5" />
              </a>
            ) : null}
            {links.map((link) => (
              <a
                className="text-muted-foreground inline-flex items-center gap-1 text-sm capitalize hover:underline"
                href={link.url}
                key={`${link.type}-${link.url}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {link.type}
                <ArrowSquareOutIcon className="size-3.5" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No company links yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
