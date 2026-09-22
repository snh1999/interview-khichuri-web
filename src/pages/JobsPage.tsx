import { PlusCircleIcon, XIcon } from "@phosphor-icons/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { ViewToggle } from "@/components/common/ViewToggle.tsx";
import { JobsDateFilter } from "@/components/jobs/filters/JobsDateFilter";
import { JobsSearchInput } from "@/components/jobs/filters/JobsSearchInput.tsx";
import {
  JobsSortMenu,
  useJobSort,
} from "@/components/jobs/filters/JobsSortMenu.tsx";
import { JobsStatusPills } from "@/components/jobs/filters/JobsStatusPills.tsx";
import { resolveDateFilters } from "@/components/jobs/filters/jobDatePresets";
import { JobPostForm } from "@/components/jobs/JobPostForm";
import { readFiltersFromParams } from "@/components/jobs/jobs.helpers.ts";
import { JobPageContent } from "@/components/jobs/view/JobPageContent.tsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobsStore } from "@/store/useJobsStore.ts";

export const JobsPage = () => (
  <AppErrorSuspense fallback={JobsPageSkeleton}>
    <JobsContent />
  </AppErrorSuspense>
);

const JobsContent = () => {
  const { search, status, dateType, datePreset, dateFrom, dateTo, resetAll } =
    useJobsStore();

  const [searchParams] = useSearchParams();
  const { currentSort } = useJobSort();

  useEffect(() => {
    readFiltersFromParams(searchParams);
  }, [searchParams]);

  const dateFilters = useMemo(
    () => resolveDateFilters({ dateType, datePreset, dateFrom, dateTo }),
    [dateType, datePreset, dateFrom, dateTo]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialDescription, setInitialDescription] = useState("");

  const openCreate = () => {
    setInitialDescription("");
    setDialogOpen(true);
  };

  const handlePasteShortcut = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInitialDescription(text);
      setDialogOpen(true);
    } catch {
      toast.error("Failed to read clipboard");
    }
  };

  useHotkeys(
    "ctrl+v, meta+v",
    () => handlePasteShortcut(),
    { enabled: !dialogOpen },
    [dialogOpen, handlePasteShortcut]
  );

  const handleSuccess = () => {
    setDialogOpen(false);
    setInitialDescription("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setInitialDescription("");
    }
  };

  const hasFilters = search || status || dateFilters.length > 0;

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-semibold text-xl">Jobs</h1>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {hasFilters ? (
            <Button onClick={resetAll} variant="outline">
              <XIcon className="size-3" weight="bold" />
              Filters
            </Button>
          ) : null}
          <JobsDateFilter />
          <JobsSortMenu />
          <ViewToggle />
          <Button onClick={openCreate} variant="outline">
            <PlusCircleIcon className="size-3" weight="bold" />
            New Job
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <JobsSearchInput />
        <JobsStatusPills />
      </div>

      <Suspense fallback={<JobsListSkeleton />}>
        <JobPageContent currentSort={currentSort} onCreate={openCreate} />
      </Suspense>

      <JobPostForm
        initialDescription={initialDescription}
        onOpenChange={handleDialogOpenChange}
        onSuccess={handleSuccess}
        open={dialogOpen}
      />
    </div>
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
