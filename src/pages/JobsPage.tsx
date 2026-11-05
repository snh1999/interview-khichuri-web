import { PlusCircleIcon, XIcon } from "@phosphor-icons/react";
import { Suspense, useMemo } from "react";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { ViewToggle } from "@/components/common/ViewToggle.tsx";
import { DiscoverTab } from "@/components/jobs/DiscoverTab.tsx";
import { CompanyFilter } from "@/components/jobs/filters/CompanyFilter.tsx";
import { JobsDateFilter } from "@/components/jobs/filters/JobsDateFilter";
import { JobsSearchInput } from "@/components/jobs/filters/JobsSearchInput.tsx";
import {
  DISCOVER_SORT_OPTIONS,
  isDiscoverSort,
  JOB_SORT_OPTIONS,
  JobsSortMenu,
} from "@/components/jobs/filters/JobsSortMenu.tsx";
import { JobsStatusSelect } from "@/components/jobs/filters/JobsStatusSelect.tsx";
import { resolveDateFilters } from "@/components/jobs/filters/jobDatePresets";
import { JobPostForm } from "@/components/jobs/JobPostForm";
import { useJobPage } from "@/components/jobs/jobs.hooks";
import { JobPageContent } from "@/components/jobs/view/JobPageContent.tsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabs } from "@/hooks/useTabs.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";

type TJobsTab = "tracked" | "discover";

export const JobsPage = () => (
  <AppErrorSuspense fallback={JobsPageSkeleton}>
    <JobsContent />
  </AppErrorSuspense>
);

const JobsContent = () => {
  const {
    search,
    status,
    dateType,
    datePreset,
    dateFrom,
    dateTo,
    resetAll,
    sort: currentSort,
  } = useJobsStore();

  const {
    initial,
    dialogOpen,
    openCreate,
    handleSuccess,
    handleDialogOpenChange,
    hasDiscoverFilters,
    clearDiscoverFilters,
    handleCompanyChange,
    activeCompanyId,
  } = useJobPage();

  const { currentTab, handleTabChange } = useTabs("tracked");
  const tab: TJobsTab = currentTab === "discover" ? "discover" : "tracked";

  const dateFilters = useMemo(
    () => resolveDateFilters({ dateType, datePreset, dateFrom, dateTo }),
    [dateType, datePreset, dateFrom, dateTo]
  );

  const hasTrackedFilters = search || status || dateFilters.length > 0;

  const isTrackedTab = tab === "tracked";
  const sort =
    isTrackedTab || isDiscoverSort(currentSort) ? currentSort : "default";
  const hasFilters = isTrackedTab ? hasTrackedFilters : hasDiscoverFilters;
  const handleClearFilters = isTrackedTab ? resetAll : clearDiscoverFilters;

  return (
    <Tabs onValueChange={handleTabChange} value={tab}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <TabsList>
            <TabsTrigger value="tracked">Tracked</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <JobsSortMenu
            options={isTrackedTab ? JOB_SORT_OPTIONS : DISCOVER_SORT_OPTIONS}
          />
          <ViewToggle />
          <Button onClick={openCreate}>
            <PlusCircleIcon className="size-3" weight="bold" />
            New Job
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <JobsSearchInput />
        {isTrackedTab ? (
          <>
            <JobsDateFilter />
            <JobsStatusSelect />
          </>
        ) : (
          <CompanyFilter
            onChange={handleCompanyChange}
            value={activeCompanyId}
          />
        )}
        {hasFilters ? (
          <Button
            className="text-destructive"
            onClick={handleClearFilters}
            variant="outline"
          >
            <XIcon className="size-3" weight="bold" />
          </Button>
        ) : null}
      </div>

      <TabsContent value="tracked">
        <Suspense fallback={<JobsListSkeleton />}>
          <JobPageContent currentSort={currentSort} onCreate={openCreate} />
        </Suspense>
      </TabsContent>

      <TabsContent value="discover">
        <Suspense fallback={<JobsListSkeleton />}>
          <DiscoverTab companyId={activeCompanyId} sort={sort} />
        </Suspense>
      </TabsContent>

      <JobPostForm
        initialDescription={initial.description}
        initialUrl={initial.url}
        onOpenChange={handleDialogOpenChange}
        onSuccess={handleSuccess}
        open={dialogOpen}
      />
    </Tabs>
  );
};

const JobsListSkeleton = () => (
  <div className="grid gap-2.5 sm:grid-cols-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <SkeletonCard key={index.toString()}>
        <Skeleton className="h-32 w-full" />
      </SkeletonCard>
    ))}
  </div>
);

const JobsPageSkeleton = () => (
  <div className="w-full">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
      <Skeleton className="h-8 w-24" />
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Skeleton className="h-10 min-w-0 flex-1" />
      <Skeleton className="h-8 w-44" />
    </div>
    <SkeletonCard>
      <Skeleton className="h-32 w-full" />
    </SkeletonCard>
  </div>
);
