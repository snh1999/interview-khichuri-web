import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { AppErrorSuspense } from "@/components/common/boundary/AppErrorSuspense";
import { SkeletonCard } from "@/components/common/boundary/SkeletonCard";
import { ViewToggle } from "@/components/common/ViewToggle.tsx";
import { JobFilter } from "@/components/prep-session/JobFilter.tsx";
import { SessionPageContent } from "@/components/prep-session/SessionPageContent.tsx";
import { PrepSessionForm } from "@/components/prep-session/session/PrepSessionForm.tsx";
import { TopicFilter } from "@/components/prep-session/TopicFilter.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton";

export const SessionsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = () => setDialogOpen(false);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setDialogOpen(true);
      setSearchParams(
        (prev) => {
          prev.delete("create");
          return prev;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const [search, setSearch] = useState("");
  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );
  const openDialog = useCallback(() => setDialogOpen(true), []);

  return (
    <AppErrorSuspense fallback={SessionsPageSkeleton}>
      <div className="w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h1 className="font-semibold text-xl">Sessions</h1>
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle />
            <JobFilter />
            <TopicFilter />
            <PrepSessionForm
              onOpenChange={setDialogOpen}
              onSuccess={closeDialog}
              open={dialogOpen}
              viewTrigger
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            className="min-w-40 flex-1"
            onChange={handleSearchChange}
            placeholder="Search sessions..."
            value={search}
          />
        </div>

        <SessionPageContent onNewSession={openDialog} search={search} />
      </div>
    </AppErrorSuspense>
  );
};

const SessionsPageSkeleton = () => (
  <div className="w-full">
    <div className="mb-6 flex items-center justify-between">
      <Skeleton className="h-8 w-24" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
    <Skeleton className="mb-4 h-10 w-64" />
    <SkeletonCard>
      <Skeleton className="h-32 w-full" />
    </SkeletonCard>
  </div>
);
