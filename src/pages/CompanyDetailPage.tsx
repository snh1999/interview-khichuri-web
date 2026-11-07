import { useEffect } from "react";
import { useParams } from "react-router";
import { useCompanyJobs } from "@/api/jobs";
import { useCompany } from "@/api/lookups";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { CompanyInfoSection } from "@/components/company/CompanyInfoSection.tsx";
import { JobDiscoveryCard } from "@/components/jobs/view/JobDiscoveryCard.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/appStore.ts";

export const CompanyDetailPage = () => (
  <AppErrorSuspense errorPage fallback={CompanyDetailSkeleton}>
    <CompanyDetailContent />
  </AppErrorSuspense>
);

const CompanyDetailContent = () => {
  const { companyId } = useParams();
  const id = Number(companyId);
  const { data: company } = useCompany(id);
  const { data: jobs } = useCompanyJobs(id);
  const setPageHeader = useAppStore((state) => state.setPageHeader);

  useEffect(() => {
    setPageHeader(company.name);
  }, [company.name, setPageHeader]);

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <CompanyInfoSection company={company} />

      <section className="flex min-h-0 flex-1 flex-col gap-2.5">
        <h2 className="text-sm font-semibold">Open jobs</h2>
        {jobs.length === 0 ? (
          <Empty fullHeight>
            <EmptyHeader>
              <EmptyTitle>No open jobs</EmptyTitle>
              <EmptyDescription>
                This company has no discoverable jobs right now.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobDiscoveryCard job={job} key={job.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const CompanyDetailSkeleton = () => (
  <div className="w-full">
    <SkeletonCard>
      <Skeleton className="h-20 w-full" />
    </SkeletonCard>
    <Skeleton className="mt-4 mb-3 h-5 w-24" />
    <div className="grid gap-2.5 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index.toString()}>
          <Skeleton className="h-28 w-full" />
        </SkeletonCard>
      ))}
    </div>
  </div>
);
