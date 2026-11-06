/** biome-ignore-all lint/performance/noJsxPropsBind: handlers need row data */
import { useState } from "react";
import { toast } from "sonner";
import {
  type IAdminJob,
  useAdminAiStatus,
  useFailedJobs,
  useRetryFailedJob,
  useRetryFailedJobs,
  useSetJobDescription,
} from "@/api/admin/companies";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { formatDate } from "@/lib/date";
import { isHttpUrl } from "@/lib/utils";

export const FailedJobsSection = () => {
  const { data: jobs = [] } = useFailedJobs();
  const { data: aiStatus } = useAdminAiStatus();
  const { mutate: retryJob } = useRetryFailedJob();
  const { mutate: retryAll, isPending: isRetryingAll } = useRetryFailedJobs();
  const [descriptionTarget, setDescriptionTarget] = useState<IAdminJob | null>(
    null
  );
  let aiLabel = "AI disabled";
  if (aiStatus?.enabled) {
    aiLabel = aiStatus.pausedUntil
      ? `AI paused until ${formatDate(aiStatus.pausedUntil)}`
      : "AI ready";
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold">Failed jobs</h2>
        <div className="flex items-center gap-2">
          <Button
            disabled={isRetryingAll || jobs.length === 0}
            onClick={() =>
              retryAll(undefined, {
                onSuccess: ({ count }) =>
                  toast.success(
                    `Retrying ${count} failed job${count === 1 ? "" : "s"}`
                  ),
              })
            }
            size="sm"
            variant="outline"
          >
            Retry all
          </Button>
          <Badge variant={aiStatus?.enabled ? "outline" : "destructive"}>
            {aiLabel}
          </Badge>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>URL</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No failed jobs.</TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.companyName}</TableCell>
                <TableCell>
                  {job.url && isHttpUrl(job.url) ? (
                    <a
                      className="underline"
                      href={job.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {job.url}
                    </a>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => retryJob(job.id)}
                      size="sm"
                      variant="outline"
                    >
                      Retry
                    </Button>
                    <Button
                      onClick={() => setDescriptionTarget(job)}
                      size="sm"
                      variant="outline"
                    >
                      Paste description
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <DescriptionDialog
        job={descriptionTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDescriptionTarget(null);
          }
        }}
      />
    </section>
  );
};

const DescriptionDialog = ({
  job,
  onOpenChange,
}: Readonly<{
  job: IAdminJob | null;
  onOpenChange: (open: boolean) => void;
}>) => {
  const [description, setDescription] = useState("");
  const { mutate: setDescriptionMutation, isPending } = useSetJobDescription();

  const submit = () => {
    if (!job) {
      return;
    }

    setDescriptionMutation(
      { description, id: job.id },
      {
        onSuccess: () => {
          setDescription("");
          onOpenChange(false);
          toast.success("Description saved");
        },
      }
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={job !== null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paste description</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <Label htmlFor="job-description">Description</Label>
          <Textarea
            id="job-description"
            onChange={(event) => setDescription(event.target.value)}
            rows={8}
            value={description}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isPending || !description.trim()}
            onClick={submit}
            size="sm"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
