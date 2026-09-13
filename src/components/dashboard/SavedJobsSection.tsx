import { ArrowSquareOutIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import type { IJob } from "@/api/jobs";
import { JOBS_PAGE } from "@/app.constants";
import { RECENT_ITEMS_COUNT } from "@/components/dashboard/dashboard.helpers";
import { JobPostForm } from "@/components/jobs/JobPostForm";
import { JobListRow } from "@/components/jobs/view/JobListRow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const SavedJobsSection = ({ jobs }: Readonly<{ jobs: IJob[] }>) => {
  const [open, setOpen] = useState(false);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-base">Saved Jobs</CardTitle>
        <CardAction className="flex items-center gap-2">
          <Button onClick={openDialog}>
            <PlusCircleIcon />
          </Button>
          <Button render={<Link to={JOBS_PAGE} />} variant="outline">
            <ArrowSquareOutIcon /> View
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {jobs.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No job posts yet — add your first one.
          </p>
        ) : (
          jobs
            .slice(0, RECENT_ITEMS_COUNT)
            .map((job) => <JobListRow hideFavorite job={job} key={job.id} />)
        )}
      </CardContent>

      <JobPostForm onOpenChange={setOpen} onSuccess={closeDialog} open={open} />
    </Card>
  );
};
