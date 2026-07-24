import { PlusCircleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type IJob, useJobs } from "@/api/jobs";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { useViewToggle, ViewToggle } from "@/components/common/ViewToggle.tsx";
import { JobPostForm } from "@/components/jobs/JobPostForm";
import { JobCardGrid } from "@/components/jobs/view/JobCardGrid.tsx";
import { JobListRow } from "@/components/jobs/view/JobListRow.tsx";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup } from "@/components/ui/item.tsx";
import { Skeleton } from "@/components/ui/skeleton";

export const JobsPage = () => (
  <AppErrorSuspense fallback={JobsPageSkeleton}>
    <JobsContent />
  </AppErrorSuspense>
);

const JobsContent = () => {
  const { data: jobs } = useJobs();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialDescription, setInitialDescription] = useState("");
  const { currentView } = useViewToggle("grid");

  const openCreate = () => {
    setInitialDescription("");
    setDialogOpen(true);
  };

  useEffect(() => {
    const pasteHandler = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        const target = e.target as HTMLElement;
        if (
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        try {
          const text = await navigator.clipboard.readText();
          setInitialDescription(text);
          setDialogOpen(true);
        } catch {
          toast.error("Failed to read clipboard");
        }
      }
    };
    window.addEventListener("keydown", pasteHandler);
    return () => window.removeEventListener("keydown", pasteHandler);
  }, []);

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
          <ViewToggle />
          <Button onClick={openCreate} variant="outline">
            <PlusCircleIcon className="size-3" weight="bold" />
            New Job Post
          </Button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No jobs yet</EmptyTitle>
            <EmptyDescription>
              Add your first job posting to get started. <br />
              Press Ctrl+v to paste from clipboard.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {currentView === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job: IJob) => (
            <JobCardGrid job={job} key={job.id} />
          ))}
        </div>
      ) : (
        <ItemGroup className="overflow-hidden rounded-md bg-card">
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
      <Skeleton className="h-10 w-28" />
    </div>
    <SkeletonCard>
      <Skeleton className="h-32 w-full" />
    </SkeletonCard>
  </div>
);
