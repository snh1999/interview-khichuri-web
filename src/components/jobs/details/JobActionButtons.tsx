import { PencilLineIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { apiClient, queryKeys } from "@/api";
import { type IJob, useDeleteJob, useTrackJob } from "@/api/jobs";
import { JOBS_PAGE } from "@/app.constants.ts";
import { JobPostForm } from "@/components/jobs/JobPostForm.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { ApiError } from "@/lib/api-client";

export const JobActionButtons = ({ job }: { job: IJob }) => {
  const navigate = useNavigate();
  const isSystemJob = Boolean(!(job.userId || job.track));
  const deleteJob = useDeleteJob();
  const trackJob = useTrackJob();

  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [isForceDeleting, setIsForceDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const removeJob = useCallback(
    async (force: boolean) => {
      try {
        await deleteJob.mutateAsync({ force, id: job.id });
        if (job.userId) {
          navigate(JOBS_PAGE);
        } else {
          await apiClient.invalidateQueries({
            queryKey: queryKeys.jobs.detail(job.id),
          });
        }
        return true;
      } catch (error) {
        if (!force && error instanceof ApiError && error.statusCode === 409) {
          setForceDeleteOpen(true);
          return false;
        }
        toast.error("Failed to delete job");
        return false;
      }
    },
    [deleteJob.mutateAsync, job.id, job.userId, navigate]
  );

  const onTrackJob = () => trackJob.mutate(job.id);

  const handleDelete = () => removeJob(false);
  const handleForceDelete = async () => {
    setIsForceDeleting(true);
    if (await removeJob(true)) {
      setForceDeleteOpen(false);
    }
    setIsForceDeleting(false);
  };

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  if (isSystemJob) {
    return (
      <Button disabled={trackJob.isPending} onClick={onTrackJob}>
        <PlusIcon className="size-3" weight="bold" />
        Track
      </Button>
    );
  }

  return (
    <>
      <Button onClick={openDialog} size="sm" variant="outline">
        <PencilLineIcon className="size-3" />
        Edit
      </Button>

      <Separator orientation="vertical" />

      <MutationButton
        actionLabel="Delete job"
        aria-label="Delete job"
        dialogTitle="Delete this job?"
        mutationFn={handleDelete}
        requireConfirmation
        variant="destructive"
      >
        <TrashIcon />
      </MutationButton>

      <JobPostForm
        job={job}
        onOpenChange={setDialogOpen}
        onSuccess={closeDialog}
        open={dialogOpen}
      />

      <AlertDialog onOpenChange={setForceDeleteOpen} open={forceDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This job has prep sessions</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting it will unlink those sessions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isForceDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isForceDeleting}
              onClick={handleForceDelete}
              variant="destructive"
            >
              Delete anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
