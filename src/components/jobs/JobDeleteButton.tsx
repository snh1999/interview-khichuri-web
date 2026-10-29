import { TrashIcon } from "@phosphor-icons/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useDeleteJob } from "@/api/jobs";
import { JOBS_PAGE } from "@/app.constants.ts";
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
import { ApiError } from "@/lib/api-client";

export const JobDeleteButton = ({ jobId }: { jobId: string }) => {
  const navigate = useNavigate();
  const deleteJob = useDeleteJob();
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [isForceDeleting, setIsForceDeleting] = useState(false);

  const removeJob = useCallback(
    async (force: boolean) => {
      try {
        await deleteJob.mutateAsync({ force, id: jobId });
        navigate(JOBS_PAGE);
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
    [deleteJob.mutateAsync, jobId, navigate]
  );

  const handleDelete = useCallback(() => removeJob(false), [removeJob]);
  const handleForceDelete = useCallback(async () => {
    setIsForceDeleting(true);
    if (await removeJob(true)) {
      setForceDeleteOpen(false);
    }
    setIsForceDeleting(false);
  }, [removeJob]);

  return (
    <>
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
