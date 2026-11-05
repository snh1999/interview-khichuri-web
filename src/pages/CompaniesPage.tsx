import {
  type ChangeEvent,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import { useCompanies } from "@/api/lookups";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { useViewToggle, ViewToggle } from "@/components/common/ViewToggle.tsx";
import { CompanyCardGrid } from "@/components/company/CompanyCardGrid.tsx";
import { CompanyListRow } from "@/components/company/CompanyListRow.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input.tsx";
import { ItemGroup } from "@/components/ui/item.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useStrictSafeAutoAnimate } from "@/hooks/useStrictSafeAutoAnimate.ts";
import { createCompanySearch } from "@/lib/search.ts";

export const CompaniesPage = () => {
  const [search, setSearch] = useState("");
  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
    []
  );

  return (
    <AppErrorSuspense fallback={CompaniesPageSkeleton}>
      <div className="flex w-full flex-1 flex-col">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold">Companies</h1>
          <ViewToggle />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            aria-label="Search companies"
            className="min-w-40 flex-1"
            onChange={handleSearchChange}
            placeholder="Search companies..."
            value={search}
          />
        </div>

        <CompanyPageContent search={search} />
      </div>
    </AppErrorSuspense>
  );
};

export const CompanyPageContent = ({
  search = "",
}: Readonly<{
  search?: string;
}>) => {
  const { data: companies } = useCompanies();
  const { currentView } = useViewToggle("grid");
  const [gridParent] = useStrictSafeAutoAnimate();
  const [listParent] = useStrictSafeAutoAnimate();

  const searchIndex = useMemo(
    () => createCompanySearch(companies),
    [companies]
  );
  const deferredSearch = useDeferredValue(search);
  const isSearching = deferredSearch.trim().length > 0;

  const filteredCompanies = useMemo(() => {
    const query = deferredSearch.trim();
    if (query.length === 0) {
      return companies;
    }
    return searchIndex.search(query).map((result) => result.doc.company);
  }, [companies, searchIndex, deferredSearch]);

  if (filteredCompanies.length === 0) {
    return (
      <Empty fullHeight>
        <EmptyHeader>
          <EmptyTitle>
            {companies.length === 0
              ? "No companies yet"
              : "No companies match your search."}
          </EmptyTitle>
          <EmptyDescription>
            {companies.length === 0
              ? "Companies will appear here once job discovery is available."
              : "Try a different company name or alias."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const countLabel = isSearching
    ? `${filteredCompanies.length} of ${companies.length} companies`
    : `${filteredCompanies.length} ${filteredCompanies.length === 1 ? "company" : "companies"}`;

  return (
    <div className="flex w-full flex-col">
      <p className="text-muted-foreground mb-2 text-right text-xs">
        {countLabel}
      </p>
      {currentView === "list" ? (
        <ItemGroup
          className="bg-card overflow-hidden rounded-sm"
          ref={listParent}
        >
          {filteredCompanies.map((company) => (
            <CompanyListRow company={company} key={company.id} />
          ))}
        </ItemGroup>
      ) : (
        <div
          className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
          ref={gridParent}
        >
          {filteredCompanies.map((company) => (
            <CompanyCardGrid company={company} key={company.id} />
          ))}
        </div>
      )}
    </div>
  );
};

const CompaniesPageSkeleton = () => (
  <div className="w-full">
    <div className="mb-6 flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-8 w-16" />
    </div>
    <Skeleton className="mb-4 h-10 w-64" />
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index.toString()}>
          <Skeleton className="h-20 w-full" />
        </SkeletonCard>
      ))}
    </div>
  </div>
);
