import { PlusCircleIcon, XIcon } from "@phosphor-icons/react";
import { useDeferredValue, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
  type IDateFilter,
  type IJob,
  type TJobStatus,
  useGetJobs,
} from "@/api/jobs";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { useViewToggle, ViewToggle } from "@/components/common/ViewToggle.tsx";
import { JobsDateFilter } from "@/components/jobs/filters/JobsDateFilter";
import { JobsSearchInput } from "@/components/jobs/filters/JobsSearchInput.tsx";
import { JobsStatusPills } from "@/components/jobs/filters/JobsStatusPills.tsx";
import {
  matchesJobDateFilters,
  resolveDateFilters,
} from "@/components/jobs/filters/jobDatePresets";
import { JobPostForm } from "@/components/jobs/JobPostForm";
import { JobCardGrid } from "@/components/jobs/view/JobCardGrid.tsx";
import { JobListRow } from "@/components/jobs/view/JobListRow.tsx";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup } from "@/components/ui/item.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useStrictSafeAutoAnimate } from "@/hooks/useStrictSafeAutoAnimate";
import { createJobSearch } from "@/lib/search.ts";
import { useJobsStore } from "@/store/useJobsStore.ts";

export const filterJobs = (
  jobs: IJob[],
  params: { status?: TJobStatus; dateFilter?: IDateFilter[] }
): IJob[] =>
  jobs.filter((job) => {
    if (params.status && job.status !== params.status) {
      return false;
    }
    return !(
      params.dateFilter && !matchesJobDateFilters(job, params.dateFilter)
    );
  });

export const JobsPage = () => (
  <AppErrorSuspense fallback={JobsPageSkeleton}>
    <JobsContent />
  </AppErrorSuspense>
);

const JobsContent = () => {
  const { search, status, dateType, datePreset, dateFrom, dateTo, resetAll } =
    useJobsStore();

  const { data: allJobsRaw } = useGetJobs();
  const searchIndex = useMemo(
    () => createJobSearch(allJobsRaw ?? []),
    [allJobsRaw]
  );

  const deferredSearch = useDeferredValue(search);

  const dateFilters = useMemo(
    () => resolveDateFilters({ dateType, datePreset, dateFrom, dateTo }),
    [dateType, datePreset, dateFrom, dateTo]
  );

  const jobs = useMemo(() => {
    const allJobs = allJobsRaw ?? [];
    const query = deferredSearch.trim();
    const searched =
      query.length === 0
        ? allJobs
        : searchIndex.search(query).map((result) => result.doc);
    return filterJobs(searched, {
      status,
      dateFilter: dateFilters,
    });
  }, [allJobsRaw, searchIndex, deferredSearch, status, dateFilters]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialDescription, setInitialDescription] = useState("");
  const { currentView } = useViewToggle("grid");
  const [gridParent] = useStrictSafeAutoAnimate();
  const [listParent] = useStrictSafeAutoAnimate();

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

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-xl">Jobs</h1>
        <div className="flex items-center gap-2">
          {search || status || dateFilters.length > 0 ? (
            <Button onClick={resetAll} variant="destructive">
              <XIcon className="size-3" weight="bold" />
              Filters
            </Button>
          ) : null}
          <JobsDateFilter />
          <ViewToggle />
          <Button onClick={openCreate} variant="outline">
            <PlusCircleIcon className="size-3" weight="bold" />
            New Job
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <JobsSearchInput />
        <JobsStatusPills />
      </div>

      {jobs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No jobs found</EmptyTitle>
            <EmptyDescription>
              {search || status || dateFilters.length > 0
                ? "Try adjusting your filters."
                : "Add your first job posting to get started. Press Ctrl+v to paste from clipboard."}
            </EmptyDescription>
          </EmptyHeader>
          {search || status || dateFilters.length > 0 ? null : (
            <EmptyContent>
              <Button onClick={openCreate} type="button">
                <PlusCircleIcon className="size-3" weight="bold" />
                New Job
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : null}

      {currentView === "grid" ? (
        <div className="grid gap-2.5 sm:grid-cols-2" ref={gridParent}>
          {jobs.map((job: IJob) => (
            <JobCardGrid job={job} key={job.id} />
          ))}
        </div>
      ) : (
        <ItemGroup
          className="overflow-hidden rounded-md bg-card"
          ref={listParent}
        >
          {jobs.map((job: IJob) => (
            <JobListRow job={job} key={job.id} />
          ))}
        </ItemGroup>
      )}

      <JobPostForm
        initialDescription={initialDescription}
        onOpenChange={handleDialogOpenChange}
        onSuccess={handleSuccess}
        open={dialogOpen}
      />
    </div>
  );
};

const JobsPageSkeleton = () => (
  <div className="w-full">
    <div className="mb-6 flex items-center justify-between">
      <Skeleton className="h-8 w-24" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-10 min-w-0 flex-1" />
      <Skeleton className="h-8 w-44" />
    </div>
    <SkeletonCard>
      <Skeleton className="h-32 w-full" />
    </SkeletonCard>
  </div>
);
