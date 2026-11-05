import { useDeferredValue, useMemo } from "react";
import {
  type IJob,
  type TJobSortKey,
  useCompanyJobs,
  useDiscoverJobs,
} from "@/api/jobs";
import { JobDiscoveryCard } from "@/components/jobs/view/JobDiscoveryCard.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useJobsStore } from "@/store/useJobsStore.ts";

// TODO: discovery is unpaginated; add paging/load-more when result volume warrants it.

interface IDiscoverTabProps {
  companyId: number | null;
  sort: TJobSortKey;
}

export const DiscoverTab = ({
  companyId,
  sort,
}: Readonly<IDiscoverTabProps>) =>
  companyId === null ? (
    <GlobalDiscoverJobs sort={sort} />
  ) : (
    <CompanyDiscoverJobs companyId={companyId} sort={sort} />
  );

const DiscoveryResults = ({ jobs }: Readonly<{ jobs: IJob[] }>) => {
  if (jobs.length === 0) {
    return (
      <Empty fullHeight>
        <EmptyHeader>
          <EmptyTitle>No jobs found</EmptyTitle>
          <EmptyDescription>
            Try a different search or company filter.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {jobs.map((job) => (
        <JobDiscoveryCard job={job} key={job.id} />
      ))}
    </div>
  );
};

const GlobalDiscoverJobs = ({ sort }: Readonly<{ sort: TJobSortKey }>) => {
  const { search } = useJobsStore();
  const deferredSearch = useDeferredValue(search);
  const { data: jobs } = useDiscoverJobs({ search: deferredSearch, sort });

  return <DiscoveryResults jobs={jobs} />;
};

const CompanyDiscoverJobs = ({
  companyId,
  sort,
}: Readonly<{ companyId: number; sort: TJobSortKey }>) => {
  const { search } = useJobsStore();
  const deferredSearch = useDeferredValue(search);
  const { data: jobs } = useCompanyJobs(companyId, sort);

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return jobs;
    }
    return jobs.filter((job) =>
      [job.title, job.companyName, job.description]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [deferredSearch, jobs]);

  return <DiscoveryResults jobs={filtered} />;
};
