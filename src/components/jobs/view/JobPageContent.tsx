import { PlusCircleIcon } from "@phosphor-icons/react";
import { useDeferredValue, useMemo } from "react";
import {
  type IDateFilter,
  type IJob,
  type TJobSortKey,
  type TJobStatus,
  useGetJobs,
} from "@/api/jobs";
import { useViewToggle } from "@/components/common/ViewToggle.tsx";
import {
  matchesJobDateFilters,
  resolveDateFilters,
} from "@/components/jobs/filters/jobDatePresets";
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

interface IProps {
  currentSort: TJobSortKey;
  onCreate: () => void;
}

export const JobPageContent = ({ currentSort, onCreate }: Readonly<IProps>) => {
  const { search, status, dateType, datePreset, dateFrom, dateTo } =
    useJobsStore();

  const { data: allJobsRaw } = useGetJobs(currentSort);
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

  const hasFilters = search || status || dateFilters.length > 0;
  const { currentView } = useViewToggle("grid");
  const [gridParent] = useStrictSafeAutoAnimate();
  const [listParent] = useStrictSafeAutoAnimate();

  return (
    <>
      {jobs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No jobs found</EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? "Try adjusting your filters."
                : "Add your first job posting to get started. Press Ctrl+v to paste from clipboard."}
            </EmptyDescription>
          </EmptyHeader>
          {hasFilters ? null : (
            <EmptyContent>
              <Button onClick={onCreate} type="button">
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
    </>
  );
};
